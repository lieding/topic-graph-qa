import { text, pgTable, uuid } from "drizzle-orm/pg-core";

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  language: text("language").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),
  question_id: uuid("question_id").notNull(),
}

export const AnswerSchema = pgTable("answer", schema);