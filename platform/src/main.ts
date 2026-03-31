import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the frontend (env-configurable)
  const origins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5500')
    .split(',')
    .map((s) => s.trim());

  app.enableCors({ origin: origins, methods: ['GET', 'POST'] });

  // All routes live under /api — e.g. GET /api/jobs, POST /api/jobs/search
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`JOBS_NORTH API listening on http://localhost:${port}/api`);
}
bootstrap();

