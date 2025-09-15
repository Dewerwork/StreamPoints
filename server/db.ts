import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // DO Managed PG typically requires TLS; if your URL has ?sslmode=require,
  // node-postgres still needs `ssl` enabled:
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
