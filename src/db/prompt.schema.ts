import { text, pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { Database } from './typing';

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  usage: text("usage").notNull(),
  topic_concerning: boolean("topic_concerning").notNull(),
  topicPath: text("topicPath"),
  role: text("role",
    { enum: [Database.Prompt.ROLE.SYSTEM, Database.Prompt.ROLE.USER] }
  ).notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
}

export const PromptSchema = pgTable("prompt", schema);