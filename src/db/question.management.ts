import { cosineDistance, exists, sql } from "drizzle-orm";
import { API } from "../api/typing";
import { DB } from "./_db";
import { QuestionSchema } from "./question.schema";
import { Database } from "./typing";
import { randomUUID } from 'node:crypto';

export function insertQuestion (data: API.IQuestionCreation, question_embedding: string) {
  const tags = data.tags.map(({ topic, subTopic, id }) => {
    return {
      topicPath: `${topic},${subTopic}` as const,
      tagId: id,
    };
  });
  const obj: Database.IQuestion = {
    id: randomUUID(),
    question: data.question,
    question_embedding,
    thought_text: data.thought,
    language: data.language,
    tags,
  };
  return DB.insert(QuestionSchema).values(obj).then(() => obj.id);
}

export function getCloseQuestionsByEmbedding (embedding: number[], topic: string, subTopic: string) {
  const topicPath = `${topic},${subTopic}`;
  return DB.select({
    id: QuestionSchema.id,
    question: QuestionSchema.question,
    thought: QuestionSchema.thought_text,
    language: QuestionSchema.language,
    tags: QuestionSchema.tags,
    distance: cosineDistance(QuestionSchema.question_embedding, embedding),
  })
  .from(QuestionSchema)
  .where(sql`exists (SELECT 1 FROM unnest(tags) AS ele WHERE ele ->> 'topicPath' = '${sql.raw(topicPath)}')`)
  .orderBy(cosineDistance(QuestionSchema.question_embedding, embedding))
  .limit(10);
}