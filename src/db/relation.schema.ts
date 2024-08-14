import { text, pgTable, uuid, integer } from "drizzle-orm/pg-core";

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  source_id: uuid("source_id").notNull(),
  source_name: text("source_name").notNull(),
  source_description: text("source_description"),
  target_id: uuid("target_id").notNull(),
  target_name: text("target_name").notNull(),
  target_description: text("target_description"),
  relation: text("relation").notNull(),
  relation_embedding: text("relation_embedding").notNull(),
  description: text("description").notNull(),
  strength: integer('strength').notNull(),
}

export function getRelationSchemaByTableName (tableName: string) {
  return pgTable(tableName, schema);
}