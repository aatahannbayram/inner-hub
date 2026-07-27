import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Sınırsız bekleme yerine hızlı başarısız ol — havuz doluysa/DB yanıt vermiyorsa
  // istekler sonsuza kadar askıda kalmasın (gözlemlenen genel yavaşlık/sonsuz yükleme).
  connectionTimeoutMillis: 10_000,
  statement_timeout: 15_000,
  max: 10,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
