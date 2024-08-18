import Router from "@koa/router";
import { API } from "../../api/typing";
import { insertQuestion } from '../../db/question.management';
import { getTextEmbeddings } from "../../embedding/openai";

const routes = new Router();

function checkValidQuestionCreation (obj: unknown): obj is API.IQuestionCreation {
  if (!obj) return false;
  const { question, language } = obj as API.IQuestionCreation;
  if (!language || !question) return false;
  return true;
}

routes.get('/answer-by-topic', async (ctx) => {
  let { question, } = ctx.request.query;
  question = question?.toString();
  
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
