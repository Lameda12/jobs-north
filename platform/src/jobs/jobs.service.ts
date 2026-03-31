import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { pipeline } from '@xenova/transformers';
import { toSql } from 'pgvector';
import { Job } from './job.entity';
import { EMBEDDING_QUEUE, EMBED_JOB_NAME } from './embedding.processor';

// Singleton model cache — loaded once, reused across all requests
let _model: any = null;
async function getModel() {
  if (!_model) {
    _model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return _model;
}

export interface SearchDto {
  query: string;
  topK?: number;
  workType?: string;  // 'remote' | 'hybrid' | 'in-person'
  province?: string;  // e.g. 'Ontario'
}

export interface ListDto {
  page?: number;
  limit?: number;
  workType?: string;
  province?: string;
  q?: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly repo: Repository<Job>,
    @InjectQueue(EMBEDDING_QUEUE)
    private readonly embeddingQueue: Queue,
  ) {}

  // ─── Semantic Search ──────────────────────────────────────────────────────

  async semanticSearch(dto: SearchDto): Promise<Job[]> {
    const { query, topK = 5, workType, province } = dto;

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('query must be a non-empty string');
    }

    this.logger.log(`Semantic search: "${query}" (topK=${topK})`);

    const model = await getModel();
    const output = await model(query, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data as Float32Array);
    const embeddingSql = toSql(embedding);

    let qb = this.repo
      .createQueryBuilder('job')
      .where('job.embedding IS NOT NULL')
      .orderBy(`job.embedding <-> :emb`, 'ASC')
      .setParameter('emb', embeddingSql)
      .limit(topK * 3); // fetch extra to allow post-filter

    if (workType && workType !== 'all') {
      qb = qb.andWhere('job.work_type = :wt', { wt: workType });
    }

    const candidates = await qb.getMany();

    // Province filter (stored inside JSON)
    let results = candidates;
    if (province) {
      results = candidates.filter((j) => {
        const area: string[] = (j.location as any)?.area ?? [];
        return area.some((a) => a.toLowerCase().includes(province.toLowerCase()));
      });
    }

    return results.slice(0, topK);
  }

  // ─── List / Paginate ──────────────────────────────────────────────────────

  async findAll(dto: ListDto = {}): Promise<{ jobs: Job[]; total: number }> {
    const { page = 1, limit = 10, workType, province, q } = dto;
    const skip = (page - 1) * limit;

    let qb = this.repo.createQueryBuilder('job');

    if (workType && workType !== 'all') {
      qb = qb.andWhere('job.work_type = :wt', { wt: workType });
    }
    if (q) {
      qb = qb.andWhere(
        "(LOWER(job.title) LIKE :q OR LOWER(job.description) LIKE :q)",
        { q: `%${q.toLowerCase()}%` },
      );
    }

    const [jobs, total] = await qb
      .orderBy('job.scraped_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Province post-filter (JSON field — can't SQL-index easily)
    let filtered = jobs;
    if (province) {
      filtered = jobs.filter((j) => {
        const area: string[] = (j.location as any)?.area ?? [];
        return area.some((a) => a.toLowerCase().includes(province.toLowerCase()));
      });
    }

    return { jobs: filtered, total };
  }

  // ─── Single Job ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Job> {
    const job = await this.repo.findOneBy({ original_id: id });
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  // ─── Create / Upsert (for scraper) ────────────────────────────────────────

  async upsert(data: Partial<Job>): Promise<Job> {
    const existing = await this.repo.findOneBy({ original_id: data.original_id });
    if (existing) {
      // Update scraped_at and description — but don't regenerate embedding unless content changed
      const titleChanged = existing.title !== data.title;
      Object.assign(existing, data);
      if (titleChanged) existing.embedding = null as any; // force re-embed via queue
      const saved = await this.repo.save(existing);
      if (!saved.embedding) await this.queueEmbed(saved.id);
      return saved;
    }

    const job = this.repo.create(data);
    const saved = await this.repo.save(job);
    await this.queueEmbed(saved.id);
    return saved;
  }

  async queueEmbed(jobId: number): Promise<void> {
    await this.embeddingQueue.add(EMBED_JOB_NAME, { jobId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}

