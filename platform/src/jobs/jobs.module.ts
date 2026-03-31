import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Job } from './job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { EmbeddingProcessor, EMBEDDING_QUEUE } from './embedding.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job]),
    BullModule.registerQueue({ name: EMBEDDING_QUEUE }),
  ],
  controllers: [JobsController],
  providers: [JobsService, EmbeddingProcessor],
  exports: [JobsService],
})
export class JobsModule {}

