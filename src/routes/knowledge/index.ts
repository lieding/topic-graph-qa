import Router from "@koa/router";
import { API, checkValidKnowledge, checkValidKnowledgeType } from "../../api/typing";
import { Database } from "../../db/typing";
import { insert as insertKnowledge } from '../../db/knowledge.management';
import { entityRelationExtraction } from '../../llm/entityRelationExtraction';
import { getKnowledgeSummary } from "../../llm/knowledgeSummary";

const routes = new Router();

function checkValidKnowledge4Parse (obj: unknown): obj is API.IKnowledgeCreation {
  if (!obj) return false;
  const { type, text, language } = obj as API.IKnowledgeCreation;
  if (!language) return false;
  if (checkValidKnowledgeType(type)) {
    if (type === Database.Knowledge.Type.TEXT && text && typeof text === 'string') {
      return true;
    }
    return false;
  }
  return false;
}

routes.post('/summarize-knowledge', async (ctx) => {
  const body = ctx.request.body as API.Knowledge.ISummary;
  const { type, text, language } = body;
  if (!type || !text || !language) throw new Error('invalid body');
  if (type === Database.Knowledge.Type.TEXT && text) {
    const res = await getKnowledgeSummary(type, '', text);
    ctx.body = res;
  }
});

routes.post('/parse-knowledge', async (ctx) => {
  const body = ctx.request.body;
  if (checkValidKnowledge4Parse(body)) {
    const { type, text, language } = body;
    if (type === Database.Knowledge.Type.TEXT && text) {
      const res = await entityRelationExtraction(text, language);
      ctx.body = res;
    }
  } else {
    throw new Error('invalid body');
  }
});

routes.post('/add-knowledge', async (ctx) => {
  const { request: { body } } = ctx;
  if (checkValidKnowledge(body)) {
    const { type, text, summary } = body;
    if (!summary) throw new Error('error happens in summary generation');
    if (checkValidKnowledgeType(type) && text) {
      await insertKnowledge(body);
      ctx.body = { status: 'ok' };
    }
  } else {
    throw new Error('invalid body');
  }
});

export default routes;