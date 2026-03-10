import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@server/env";
import * as schema from "@lattice/db";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
