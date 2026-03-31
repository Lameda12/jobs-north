import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/job.entity';

@Module({
  imports: [
    // Load env vars from .env file
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting — 60 requests per minute per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // PostgreSQL + pgvector — all credentials from env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'user'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_NAME', 'jobs_north'),
        entities: [Job],
        // synchronize: true is OK for dev. Use migrations in prod.
        synchronize: true,
      }),
    }),

    // Bull job queue backed by Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // Cron scheduler (for future data pipeline)
    ScheduleModule.forRoot(),

    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

