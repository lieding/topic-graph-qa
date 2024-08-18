import { arrayContains, arrayOverlaps, cosineDistance, exists, sql } from "drizzle-orm";
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
  const _topic_path_list = tags.map(({ topicPath }) => topicPath);
  const obj: Database.IQuestion = {
    id: randomUUID(),
    question: data.question,
    question_embedding,
    thought_text: data.thought,
    language: data.language,
    tags,
    _topic_path_list,
  };
  return DB.insert(QuestionSchema).values(obj).then(() => obj.id);
}

export type RetrievedCloseQuestionType = Awaited<ReturnType<typeof getCloseQuestionsByEmbedding>>

export function getCloseQuestionsByEmbedding (embedding: number[], topicConfig: {topic: string, subTopic: string}[]) {
  const topicPathList = topicConfig.map(({ topic, subTopic }) => `${topic},${subTopic}`);
  return DB.select({
    id: QuestionSchema.id,
    question: QuestionSchema.question,
    thought: QuestionSchema.thought_text,
    language: QuestionSchema.language,
    tags: QuestionSchema.tags,
    similarity: cosineDistance(QuestionSchema.question_embedding, embedding),
  })
  .from(QuestionSchema)
  .where(arrayOverlaps(QuestionSchema._topic_path_list, topicPathList))
  .orderBy(cosineDistance(QuestionSchema.question_embedding, embedding))
  .limit(10);
}