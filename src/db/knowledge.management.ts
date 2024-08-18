import { and, eq, arrayOverlaps, arrayContains } from 'drizzle-orm'
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
  const _path_id_list = tags.map(({ topicPath, tagId }) => `${topicPath}$${tagId}`);
  if (type === Database.Knowledge.Type.TEXT && text) {
    knowledgeData = {
      id: randomUUID(),
      type: Database.Knowledge.Type.TEXT,
      summary,
      language,
      tags,
      text,
      _path_id_list,
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
  const pathIdList = [`${topic},${subTopic}$${tagId}`];
  return DB.select({
    id: KnowledgeSchema.id,
    summary: KnowledgeSchema.summary,
    language: KnowledgeSchema.language,
    text: KnowledgeSchema.text
  })
    .from(KnowledgeSchema)
    .where(and(
      eq(KnowledgeSchema.type, Database.Knowledge.Type.TEXT),
      arrayContains(KnowledgeSchema._path_id_list, pathIdList)
    ));
}