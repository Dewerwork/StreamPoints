// server/db.ts (ESM-safe, DigitalOcean Postgres)

import pg from "pg";
const { Pool } = pg;

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // DO Managed PG uses TLS; keep this if your URL has ?sslmode=require
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

// (optional) helper to close cleanly on shutdown
export async function closeDb() {
  await pool.end();
}
