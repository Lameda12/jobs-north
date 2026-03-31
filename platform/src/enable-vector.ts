import { Client } from 'pg';

async function enableVectorExtension() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'password',
    database: 'jobs_north',
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('The "vector" extension has been enabled.');

  } catch (err) {
    console.error('Error enabling "vector" extension:', err);
  } finally {
    await client.end();
    console.log('Connection to the database has been closed.');
  }
}

enableVectorExtension();
