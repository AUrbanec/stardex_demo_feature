import { createClient } from "@libsql/client";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const isProd = process.env.NODE_ENV === "production" && process.env.SUPABASE_URL;

let dbInstance: ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzlePg>;

if (isProd) {
  const queryClient = postgres(process.env.SUPABASE_URL as string);
  dbInstance = drizzlePg(queryClient);
  console.log("Connected to Supabase Postgres");
} else {
  const sqliteClient = createClient({ url: "file:local.sqlite" });
  dbInstance = drizzleSqlite(sqliteClient);
  console.log("Connected to Local SQLite");
}

export const db = dbInstance;
