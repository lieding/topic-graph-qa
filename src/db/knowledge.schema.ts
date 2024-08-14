import { text, pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { Database } from './typing'

const TypeEnum = [
  Database.Knowledge.Type.TEXT,
  Database.Knowledge.Type.IMAGE,
  Database.Knowledge.Type.TABLE,
  Database.Knowledge.Type.VIDEO
] as const;

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  summary: text("summary").notNull(),
  language: text("language"),
  type: text("type", { enum: TypeEnum }).notNull(),
  tags: jsonb("tags").array().$type<Database.IExternalTag[]>().notNull(),
  text: text("text"),
  content: text("content"),
  url: text("url"),
}

export const KnowledgeSchema = pgTable("knowledge", schema);