import { text, pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { Database } from "./typing";


const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  question_embedding: text("question_embedding").notNull(),
  thought_text: text("thought_text"),
  language: text("language").notNull(),
  tags: jsonb("tags").array()
    .$type<Omit<Database.IExternalTag, 'relationId'>[]>()
    .notNull(),
}

export const QuestionSchema = pgTable("question", schema);