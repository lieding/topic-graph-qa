import { and, eq, sql } from 'drizzle-orm'
import { DB } from "./_db";
import { KnowledgeSchema } from "./knowledge.schema";
import { Database } from "./typing";
import { randomUUID } from 'node:crypto';
import { API } from '../api/typing';


export async function insert (data: API.IKnowledgeCreation) {
  const { type, language, content, text, summary } = data;
  let knowledgeData: Database.Knowledge.KnowledgeType | null = null;
  const tags: Database.IExternalTag[] = data.tags.map(({ topic, subTopic, id, relationId }) => {
    return {
      topicPath: `${topic},${subTopic}`,
      tagId: id,
      relationId
    };
  });
  if (type === Database.Knowledge.Type.TEXT && text) {
    knowledgeData = {
      id: randomUUID(),
      type: Database.Knowledge.Type.TEXT,
      summary,
      language,
      tags,
      text
    };
  }
  if (!knowledgeData) {
    return null;
  }
  return DB.insert(KnowledgeSchema).values(knowledgeData);
}

export function retrieveAll () {
  return DB.select().from(KnowledgeSchema);
}

export type KnowledgeRetrieveByTagIdType = Awaited<ReturnType<typeof retrieveByTagId>>;

export function retrieveByTagId (topic: string, subTopic: string, tagId: string) {
  const topicPath = [topic, subTopic].join(',');
  return DB.select({
    summary: KnowledgeSchema.summary,
    language: KnowledgeSchema.language,
    text: KnowledgeSchema.text
  })
    .from(KnowledgeSchema)
    .where(and(
      eq(KnowledgeSchema.type, Database.Knowledge.Type.TEXT),
      sql`exists (SELECT 1 FROM unnest(tags) AS ele WHERE ele ->> 'topicPath' = '${sql.raw(topicPath)}')`
    ));
}