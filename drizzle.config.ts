import { defineConfig } from "drizzle-kit";

const isProd = process.env.NODE_ENV === "production" && process.env.SUPABASE_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isProd ? "postgresql" : "sqlite",
  dbCredentials: isProd
    ? {
        url: process.env.SUPABASE_URL as string,
      }
    : {
        url: "file:local.sqlite",
      },
});
