import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL for DigitalOcean PostgreSQL
// Always use SSL with bypassed cert validation when connecting to DigitalOcean

// For DigitalOcean, bypass SSL certificate validation at process level
if (process.env.DATABASE_URL?.includes('ondigitalocean')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('ondigitalocean') ? {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  } : false,
});

export { pool };
export const db = drizzle(pool, { schema });
