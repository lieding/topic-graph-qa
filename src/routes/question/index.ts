import Router from "@koa/router";
import { API } from "../../api/typing";
import { insertQuestion } from '../../db/question.management';
import { getTextEmbeddings } from "../../embedding/openai";
import { checkValidTopicPath } from "../../utils";
import { retrieveRelationsAndKnowledge } from "./helper";

const routes = new Router();

function checkValidQuestionCreation (obj: unknown): obj is API.IQuestionCreation {
  if (!obj) return false;
  const { question, language } = obj as API.IQuestionCreation;
  if (!language || !question) return false;
  return true;
}

routes.get('/answer-by-topic', async (ctx) => {
  let { question, topic, subTopic } = ctx.request.query;
  question = question?.toString();
  topic = topic?.toString();
  subTopic = subTopic?.toString();
  if (!question || !topic || !subTopic) throw new Error('invalid params');
  const topicConfig = checkValidTopicPath([topic, subTopic].join('/'));
  if (!topicConfig) throw new Error('invalid topicPath');
  const { tagDB, relationDB } = topicConfig;
  const { relations, knowledges } =
    await retrieveRelationsAndKnowledge(question, topic, subTopic, tagDB, relationDB);
  
});

routes.post('/add-question', async (ctx) => {
  const { request: { body } } = ctx;
  if (checkValidQuestionCreation(body)) {
    const { question } = body;
    const [embedding] = await getTextEmbeddings([question]);
    if (!embedding) throw new Error('embedding fails');
    const insertedId = await insertQuestion(body, embedding);
    ctx.body = { insertedId };
  } else {
    throw new Error('invalid body');
  }
});

export default routes;
