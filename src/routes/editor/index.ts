import Router from "@koa/router";
import { retrieveAll as retrieveAllRelations } from '../../db/relation.management'
import { getTopicDBConfig } from '../../utils'
import { addRelation, addTag } from "./helper";
import { checkValidTag, checkValidRelation } from "../../api/typing";
import { getCloseTagByEmbedding } from "../../db/tag.management";
import { getTextRawEmbedding } from "../../embedding/openai";

const routes = new Router();

routes.get('/all-relations', async (ctx) => {
  const { params: { topic, subtopic } } = ctx;
  if (!topic || !subtopic) throw new Error('invalid params');
  const { relation_db_name } = getTopicDBConfig(topic, subtopic);
  ctx.body = await retrieveAllRelations(relation_db_name)
});

routes.get('/search-close-nodes', async (ctx) => {
  const { params: { topic, subtopic } } = ctx;
  if (!topic || !subtopic) throw new Error('invalid params');
  const { name, types } = ctx.request.query;
  const { tag_db_name } = getTopicDBConfig(topic, subtopic);
  if  (!name) throw new Error('name is required');
  const typeArr = types?.toString()?.split(',');
  if (!typeArr?.length) throw new Error('types is required');
  const embedding = (await getTextRawEmbedding([name.toString()]))[0];
  if (!embedding) throw new Error('embedding fails');
  const nodes = await getCloseTagByEmbedding(tag_db_name, typeArr, embedding);
  ctx.body = { nodes };
});

routes.post('/add-tag', async (ctx) => {  
  const { params: { topic, subtopic }, request: { body } } = ctx;
  if (!topic || !subtopic) throw new Error('invalid params');
  const { tag_db_name } = getTopicDBConfig(topic, subtopic);
  if (checkValidTag(body)) {
    const insertedId = await addTag(tag_db_name, body);
    ctx.body = { insertedId };
  }
});

routes.post('/add-relation', async (ctx) => {  
  const { params: { topic, subtopic }, request: { body } } = ctx;
  if (!topic || !subtopic) throw new Error('invalid params');
  const { relation_db_name } = getTopicDBConfig(topic, subtopic);
  if (checkValidRelation(body)) {
    const insertedId = await addRelation(relation_db_name, body);
    ctx.body = { insertedId };
  }
});


export default routes;