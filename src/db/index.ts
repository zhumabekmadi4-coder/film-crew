import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL ?? "postgres://build:build@build/build");
export const db = drizzle(sql, { schema });

export type DB = typeof db;
