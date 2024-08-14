import { text, pgTable, uuid } from "drizzle-orm/pg-core";

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  types: text("types").array().notNull(),
  wiki_url: text("wiki_url"),
  name_embedding: text("name_embedding"),
  // reference to another tag od the same table
  // REMEMBER  this field is used to indicate the node with same semantic meaning bit with another name
  // like "92省" and "Hauts-de-Seine"
  reference_to: uuid("reference_to"),
}

export function getTagSchemaByTableName (tableName: string) {
  return pgTable(tableName, schema);
}