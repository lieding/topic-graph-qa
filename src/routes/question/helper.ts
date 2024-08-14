import pc from 'picocolors';
import { rerankByJina } from "../../api/jinaReranker";
import { getCloseQuestionsByEmbedding } from "../../db/question.management";
import { getCloseTagByEmbedding } from "../../db/tag.management";
import { Database } from "../../db/typing";
import { getTextRawEmbedding } from "../../embedding/openai";
import { getTagDetection } from "../../llm/tagDetection";
import { tagSelection } from "../../llm/tagSelection";
import { getTagTypeConfig, logDev } from "../../utils";
import {
  KnowledgeRetrieveByTagIdType,
  retrieveByTagId as retrieveKnowledgeByTagId
} from '../../db/knowledge.management';
import {
  RelationRetrieveByTagIdType,
  retrieveByTagId as retrieveRelationByTagId
} from '../../db/relation.management';
import { rewriteQuestion } from "../../llm/questionRewrite";

export async function retrieveRelationsAndKnowledge (
  question: string,
  topic: string,
  subTopic: string,
  tagDB: string,
  relationDB: string,
) {
  let [rerankedQuestions, tags] = await Promise.all([
    searchRerankCloseQuestions(question, topic, subTopic),
    detectTag(question, topic, subTopic, tagDB),
  ]);
  if (!rerankedQuestions.length) {
    console.log('now rewrite the original question');
    rerankedQuestions = await rewriteQuestions2Retry(question, topic, subTopic);
  }
  logDev(() => pc.green('Detected tags:'));
  logDev(() => tags?.map(it => JSON.stringify(it)).join('\n') ?? '');
  logDev(() => pc.green('Reranked questions:'));
  logDev(() => rerankedQuestions?.map(it => JSON.stringify(it)).join('\n') ?? '');
  const tagIdSet = new Set<string>();
  for (const it of tags ?? []) tagIdSet.add(it.id);
  for (const question of rerankedQuestions ?? [])
    for (const tag of question.tags ?? [])
      tagIdSet.add(tag.tagId);
  const tagIds = [...tagIdSet];
  logDev(() => `tagIds: ${tagIds.join('\n')}`);
  const relationRetrievePromises =
    tagIds.map(it => retrieveRelationByTagId(relationDB, it));
  const knowledgeRetrievePromises =
    tagIds.map(it => retrieveKnowledgeByTagId(topic, subTopic, it));
  const relations: RelationRetrieveByTagIdType = [],
    knowledges: KnowledgeRetrieveByTagIdType = [];
  await Promise.all([
    ...relationRetrievePromises,
    ...knowledgeRetrievePromises,
  ]).then((res) => {
    for (const resIt of res) {
      for (const it of resIt) {
        if (!it) continue;
        if ('relation' in it) relations.push(it);
        if ('summary' in it) knowledges.push(it);
      }
    }
  });
  return { relations, knowledges };
}

async function rewriteQuestions2Retry (question: string, topic: string, subTopic: string) {
  const generatedQuestions = await rewriteQuestion(question, topic, subTopic);
  if (!generatedQuestions?.length) return [];
  return Promise.all(generatedQuestions.map(it => searchRerankCloseQuestions(it, topic, subTopic)))
    .then(res => {
      const ret = [];
      for (const it of res) {
        for (const itIt of it) {
          if (itIt) ret.push(itIt);
        }
      }
      return ret;
    });
}

async function searchRerankCloseQuestions (question: string, topic: string, subTopic: string) {
  const embedding = (await getTextRawEmbedding([question]))[0];
  if (!embedding) throw new Error('embedding fails');
  const questions = await getCloseQuestionsByEmbedding(embedding, topic, subTopic);
  const filteredQuestions = questions?.filter(it => Number(it.distance) < 0.6);
  if (!filteredQuestions?.length || filteredQuestions.length === 1)
    return filteredQuestions ?? [];
  const questionTexts = filteredQuestions.map(it => it.question);
  const rerankRes = await rerankByJina(question, questionTexts);
  if (!rerankRes) {
    console.error('rerank fails');
    return [];
  };
  const rerankedRes = rerankRes.results.map(it => filteredQuestions[it.index]);
  const ret = [];
  for (const it of rerankedRes) {
    if (it) ret.push(it);
  }
  return ret;
}

async function detectTag (question: string, topic: string, subTopic: string, tableName: string) {
  const detectedTags = await getTagDetection(topic, subTopic, question);
  if (!detectedTags?.length) return [];
  const typeConfig = getTagTypeConfig(topic, subTopic);
  const promises = detectedTags
    .map(it => searchTagByEmbedding(it.text, it.types, tableName, typeConfig));
  const tags = await Promise.all(promises);
  const filteredTags = [];
  for (const it of tags) {
    if (it) filteredTags.push(it as unknown as Database.Tag.ITag);
  }
  return await tagSelection(topic, subTopic, question, filteredTags);
}

async function searchTagByEmbedding (
  tag: string,
  types: string[],
  tableName: string,
  typeConfig: string[]
) {
  const embedding = (await getTextRawEmbedding([tag]))[0];
  if (!embedding) return null;
  const filteredTypes = types.filter(it => typeConfig.includes(it));
  return getCloseTagByEmbedding(tableName, filteredTypes, embedding);
}