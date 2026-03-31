import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JobsService } from './jobs/jobs.service';
import * as fs from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jobsService = app.get(JobsService);

  console.log('Starting seed...');

  const jobCount = await jobsService.count();
  if (jobCount > 0) {
    console.log(`Database already has ${jobCount} jobs. Exiting.`);
    await app.close();
    return;
  }

  const jobsPath = path.join(__dirname, '..', '..', 'jobs.json');
  const raw = await fs.readFile(jobsPath, 'utf-8');
  const jobs: any[] = JSON.parse(raw);

  console.log(`Seeding ${jobs.length} jobs...`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    process.stdout.write(`  [${i + 1}/${jobs.length}] ${job.title}\r`);

    await jobsService.upsert({
      original_id: String(job.id),
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contract_time: job.contract_time ?? 'part_time',
      work_type: job.work_type ?? 'in-person',
      category: job.category,
      redirect_url: job.redirect_url,
      source: 'seed',
    });
  }

  console.log(`\nSeeding complete. ${jobs.length} jobs queued for embedding.`);
  console.log('Run the server (npm run start:dev) and Bull will generate embeddings in the background.');
  await app.close();
}

bootstrap();

