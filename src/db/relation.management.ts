import { API } from '../api/typing';
import { DB } from './_db';
import { getRelationSchemaByTableName } from './relation.schema';
import { Database } from './typing';
import { randomUUID } from 'node:crypto';
import {eq, or} from 'drizzle-orm'

export function insert (tableName: string, data: API.IRelation & {
  relation_embedding: string,
}) {
  const id = randomUUID();
  const relationData: Database.Relation.IRelation = {
    id,
    source_id: data.sourceId,
    target_id: data.targetId,
    source_name: data.source,
    target_name: data.target,
    source_description: data.sourceDesc,
    target_description: data.targetDesc,
    relation: data.relation,
    relation_embedding: data.relation_embedding,
    description: data.relationDesc,
    strength: data.strength,
  }
  return DB.insert(getRelationSchemaByTableName(tableName))
    .values(relationData)
    .then(() => relationData.id);
}

export function retrieveAll (tableName: string) {
  const schema = getRelationSchemaByTableName(tableName);
  return DB
    .select({
      id: schema.id,
      sourceId: schema.source_id,
      sourceName: schema.source_name,
      sourceDescription: schema.source_description,
      targetId: schema.target_id,
      targetName: schema.target_name,
      relation: schema.relation,
      description: schema.description,
      strength: schema.strength
    })
    .from(schema);
}

export type RelationRetrieveByTagIdType = Awaited<ReturnType<typeof retrieveByTagId>>

export function retrieveByTagId (tableName: string, tagId: string) {
  const schema = getRelationSchemaByTableName(tableName);
  return DB.selectDistinct({
    relation: schema.relation,
    description: schema.description,
    target: schema.target_name,
    target_description: schema.target_description,
    source: schema.source_name,
    source_description: schema.source_description
  })
    .from(schema)
    .where(or(
      eq(schema.source_id, tagId),
      eq(schema.target_id, tagId)
    ));
}