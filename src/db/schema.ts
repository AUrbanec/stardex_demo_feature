import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const schemaMappings = sqliteTable("schema_mappings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  originalFields: text("original_fields").notNull(),
  targetField: text("target_field").notNull(),
  dataType: text("data_type").notNull(),
  approved: integer("approved", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
