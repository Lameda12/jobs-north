import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { toSql } from 'pgvector';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobsRepository.create(jobData);
    return this.jobsRepository.save(job);
  }

  findAll(): Promise<Job[]> {
    return this.jobsRepository.find();
  }

  async findNearest(embedding: number[], limit = 5): Promise<Job[]> {
    const embeddingSql = toSql(embedding);
    return this.jobsRepository
      .createQueryBuilder('job')
      .orderBy('job.embedding <-> :embedding', 'ASC')
      .setParameter('embedding', embeddingSql)
      .limit(limit)
      .getMany();
  }

  async count(): Promise<number> {
    return this.jobsRepository.count();
  }
}
