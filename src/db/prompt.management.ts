import { checkValidTopicPath } from "../utils";
import { DB } from "./_db";
import { PromptSchema } from "./prompt.schema";
import { Database } from "./typing";
import { eq, and } from 'drizzle-orm';

export type PromptTrtrieveConfig = {
  usage: Database.Prompt.Usage.QUESTION_TAG_DETECTION
  topicPath: string
} | {
  usage: Database.Prompt.Usage.QUESTION_REWRITE
  topicPath: string
} | {
  usage: Database.Prompt.Usage.QUESTION_TAG_SELECTION
  topicPath: string
} | {
  usage: Database.Prompt.Usage.ANSWER_GENERATION
  topicPath: string
  role: Database.Prompt.ROLE
} | {
  usage: Database.Prompt.Usage.INTENT_PHRASE_RETRIEVAL
  topicPath: string
}

export function getPrompt (config: PromptTrtrieveConfig) {
  const { usage } = config;
  if ([
    Database.Prompt.Usage.QUESTION_TAG_DETECTION,
    Database.Prompt.Usage.QUESTION_REWRITE,
    Database.Prompt.Usage.QUESTION_TAG_SELECTION,
    Database.Prompt.Usage.INTENT_PHRASE_RETRIEVAL,
  ].includes(usage)) {
    const topicConfig = config.topicPath;
    if (!topicConfig) throw new Error('invalid topicPath');
    const {topic, subTopic} = checkValidTopicPath(topicConfig) ?? {};
    if (!topic || !subTopic) throw new Error('invalid topicPath');
    return DB.select().from(PromptSchema).where(and(
      eq(PromptSchema.usage, usage),
      eq(PromptSchema.topic_concerning, true),
      eq(PromptSchema.topicPath, topicConfig)
    ));
  }
  if (usage === Database.Prompt.Usage.ANSWER_GENERATION) {
    const { topicPath, role } = config;
    if (!topicPath) throw new Error('invalid topicPath');
    return DB.select().from(PromptSchema).where(and(
      eq(PromptSchema.usage, usage),
      eq(PromptSchema.topicPath, topicPath),
      eq(PromptSchema.role, role)
    ));
  }
}

export function updatePromptById (id: string, content: string, description: string) {
  return DB
    .update(PromptSchema)
    .set({ content, description })
    .where(eq(PromptSchema.id, id))
    .returning();
}