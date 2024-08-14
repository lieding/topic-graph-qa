import { API } from '../../api/typing';
import { getTextEmbeddings } from '../../embedding/openai';
import { insert as insertTag } from '../../db/tag.management';
import { insert as insertRelation } from '../../db/relation.management';

export async function addTag (tagDBName: string, data: API.ITag) {
  const { name, description, types, wikiUrl } = data;
  const [ name_embedding ] = await getTextEmbeddings([name]);
  if (!name_embedding) throw new Error('name embedding fails');
  return await insertTag(tagDBName, {
    name,
    description: description,
    types,
    wikiUrl,
    name_embedding
  });
}

export async function addRelation (relationDBName: string, data: API.IRelation) {
  const { sourceId, source, targetId, target, relation, relationDesc } = data;
  if (!sourceId || !source) throw new Error('invalid source info');
  if (!targetId || !target) throw new Error('invalid target info');
  if (!relation || !relationDesc) throw new Error('invalid relation info');
  const [ relation_embedding ] = await getTextEmbeddings([relation]);
  if (!relation_embedding) throw new Error('relation embedding fails');
  return await insertRelation(relationDBName, {...data, relation_embedding});
}