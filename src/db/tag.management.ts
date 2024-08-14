import { API } from '../api/typing';
import { DB } from './_db';
import { getTagSchemaByTableName } from './tag.schema';
import { Database } from './typing';
import { randomUUID } from 'node:crypto';
import { cosineDistance, arrayOverlaps, sql } from 'drizzle-orm';

export function insert (tableName: string, data: API.ITag & { name_embedding: string }) {
  const id = randomUUID();
  const tagData: Database.Tag.ITag = {
    id,
    name: data.name,
    description: data.description,
    types: data.types,
    wiki_url: data.wikiUrl,
    name_embedding: data.name_embedding
  }
  return DB.insert(getTagSchemaByTableName(tableName)).values(tagData).then(() => id);
}

export function insertReferenceNode (
  tableName: string,
  name: string,
  name_embedding: string,
  referenceNodeId: string,
  data?: { description: string }
) {
  const id = randomUUID();
  const tagData: Database.Tag.ITag = {
    id,
    name,
    description: data?.description ?? '',
    types: [],
    wiki_url: '',
    name_embedding: name_embedding,
    reference_to: referenceNodeId
  }
  return DB.insert(getTagSchemaByTableName(tableName)).values(tagData).then(() => id);
}

export function retrieveAll (tableName: string) {
  const schema = getTagSchemaByTableName(tableName);
  return DB
    .select({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      types: schema.types,
      wikiUrl: schema.wiki_url
    })
    .from(schema);
}

export function getCloseTagByEmbedding (tableName: string, types: string[], embedding: number[], limit = 10) {
  const schema = getTagSchemaByTableName(tableName);
  const selectFields = {
    id: schema.id,
    name: schema.name,
    description: schema.description,
    types: schema.types,
    wikiUrl: schema.wiki_url,
    distance: cosineDistance(schema.name_embedding, embedding),
  };
  return types.length ?
    DB.select(selectFields)
      .from(schema)
      .where(arrayOverlaps(schema.types, types))
      .orderBy(cosineDistance(schema.name_embedding, embedding))
      .limit(limit)
    : DB.select(selectFields)
      .from(schema)
      .orderBy(cosineDistance(schema.name_embedding, embedding))
      .limit(limit);
}

export type CloseTagSearchItemType = Awaited<ReturnType<typeof getCloseTagByEmbedding>>;
