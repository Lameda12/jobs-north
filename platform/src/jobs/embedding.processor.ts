import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job as BullJob } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pipeline } from '@xenova/transformers';
import { Job } from './job.entity';

export const EMBEDDING_QUEUE = 'embedding';
export const EMBED_JOB_NAME = 'embed-job';

let _pipe: ReturnType<typeof pipeline> extends Promise<infer T> ? T : never;

async function getModel() {
  if (!_pipe) {
    _pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as any;
  }
  return _pipe;
}

@Processor(EMBEDDING_QUEUE)
export class EmbeddingProcessor {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
  ) {}

  @Process(EMBED_JOB_NAME)
  async handleEmbed(bullJob: BullJob<{ jobId: number }>) {
    const { jobId } = bullJob.data;
    const job = await this.jobsRepo.findOneBy({ id: jobId });

    if (!job) {
      this.logger.warn(`Job ${jobId} not found — skipping embed`);
      return;
    }
    if (job.embedding) {
      this.logger.debug(`Job ${jobId} already has an embedding — skipping`);
      return;
    }

    this.logger.log(`Generating embedding for job ${jobId}: "${job.title}"`);
    const model = await getModel();
    const text = `${job.title} ${job.description}`.replace(/<[^>]*>/g, ' ').slice(0, 2000);
    const output = await (model as any)(text, { pooling: 'mean', normalize: true });
    job.embedding = Array.from(output.data as Float32Array);
    await this.jobsRepo.save(job);
    this.logger.log(`Embedded job ${jobId} ✓`);
  }
}
