import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JobsService } from './jobs/jobs.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pipeline } from '@xenova/transformers';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jobsService = app.get(JobsService);

  console.log('Starting database seed process...');

  const jobCount = await jobsService.count();
  if (jobCount > 0) {
    console.log('Database already seeded. Exiting.');
    await app.close();
    return;
  }

  console.log('Loading AI model for embeddings...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('Reading jobs.json...');
  const jobsPath = path.join(__dirname, '..', '..', 'jobs.json');
  const jobsFile = await fs.readFile(jobsPath, 'utf-8');
  const jobs = JSON.parse(jobsFile);

  console.log(`Found ${jobs.length} jobs. Generating embeddings and saving to database...`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`Processing job ${i + 1} of ${jobs.length}: ${job.title}`);

    const description = (job.title + ' ' + job.description).replace(/<[^>]*>/g, ' ');
    const output = await extractor(description, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    await jobsService.create({
      original_id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contract_time: job.contract_time,
      work_type: job.work_type,
      category: job.category,
      redirect_url: job.redirect_url,
      embedding: embedding,
    });
  }

  console.log('Database seeding complete.');
  await app.close();
}

bootstrap();
