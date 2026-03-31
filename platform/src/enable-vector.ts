import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function enableVectorExtension() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME ?? 'jobs_north',
  });

  try {
    await client.connect();
    console.log('✓ Connected to the database.');

    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✓ pgvector extension enabled.');

    // HNSW index — fast approximate nearest-neighbor search (production-grade)
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS jobs_embedding_hnsw_idx
      ON jobs USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    console.log('✓ HNSW index created on jobs.embedding.');

  } catch (err) {
    console.error('Error during vector setup:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Done.');
  }
}

enableVectorExtension();

