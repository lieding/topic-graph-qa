import { DB } from "./_db";
import { AnswerSchema } from "./answer.schema";
import { eq } from 'drizzle-orm';

export type RetrievedAnswer = Awaited<ReturnType<typeof retrieveByQuestionId>>;

export function retrieveByQuestionId (questionId: string) {
  return DB
    .select()
    .from(AnswerSchema)
    .where(eq(AnswerSchema.question_id, questionId));
}