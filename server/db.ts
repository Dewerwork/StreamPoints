import pg from "pg";
const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { DATABASE_URL, DB_CA_CERT } = process.env;
if (!DATABASE_URL) throw new Error("DATABASE_URL must be set.");

const ssl =
  DB_CA_CERT && DB_CA_CERT.trim()
    ? { ca: DB_CA_CERT.replace(/\\n/g, "\n") }
    : { rejectUnauthorized: false };  // fallback only if no CA provided

export const pool = new Pool({ connectionString: DATABASE_URL, ssl });
export const db = drizzle(pool, { schema });
