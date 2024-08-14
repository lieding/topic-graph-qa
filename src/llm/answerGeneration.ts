import { KnowledgeRetrieveByTagIdType } from "../db/knowledge.management";
import { RelationRetrieveByTagIdType } from "../db/relation.management";
import { getAnswerGenerationPrompt } from "../prompts/answerGeneration";
import { logDev } from "../utils";

export async function answerGeneration (
  question: string,
  language: string,
  topic: string,
  subTopic: string,
  knowledges: KnowledgeRetrieveByTagIdType,
  relations: RelationRetrieveByTagIdType
) {
  const { system, user } = await getAnswerGenerationPrompt(question,
    topic, subTopic, knowledges, relations);
  logDev(() => `system prompt: ${system}`);
  logDev(() => `user prompt: ${user}`);
}