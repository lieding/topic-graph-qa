import pc from 'picocolors';
import { rerankByJina } from "../../api/jinaReranker";
import { getCloseQuestionsByEmbedding, RetrievedCloseQuestionType } from "../../db/question.management";
import { getCloseTagByEmbedding } from "../../db/tag.management";
import { Database } from "../../db/typing";
import { getTextRawEmbedding } from "../../embedding/openai";
import { getTagDetection } from "../../llm/tagDetection";
import { tagSelection } from "../../llm/tagSelection";
import { checkValidTopicPath, getTagTypeConfig, logDev } from "../../utils";
import {
  KnowledgeRetrieveByTagIdType,
  retrieveByTagId as retrieveKnowledgeByTagId
} from '../../db/knowledge.management';
import {
  RelationRetrieveByTagIdType,
  retrieveByTagId as retrieveRelationByTagId
} from '../../db/relation.management';
import { getRawEmbedding as getRawEmbeddingByVoyageAI } from '../../embedding/voyageai';
import { retrieveIntentPhrases } from '../../llm/intentPhraseRetrieval';
import { retrieveByQuestionId, RetrievedAnswer } from '../../db/answer.management';

type DetectedTopicType = {
  topic: string,
  subTopic: string,
  tagDB: string,
  relationDB: string
}

export async function processTopicDetcctedQuestion (
  question: string,
  language: string,
  detected: { topic: string, subTopic: string }[],
) {
  const embedding = await getRawEmbeddingByVoyageAI(question);
  if (!embedding) throw new Error('embedding fails');
  let rerankedQuestions =
    await searchRerankCloseQuestions(question, embedding, detected);
  // if there exists the questions very close to the input question,
  // then we would generate the answer based on them
  const fileredQuestions = rerankedQuestions?.filter(it => it.jinaRelvence > 0.6);
  if (fileredQuestions.length) {
    logDev(() => {
      const info = fileredQuestions
        .map((it, idx) => `${idx}. ${it.question} (${it.jinaRelvence})`)
        .join('\n');
      return pc.green('Having found such most relevant questions:\n' + info);
    });
    logDev(() => pc.green('Generating answer based on the information above without extra queries'));
    
    const answerRetrieverPromises = fileredQuestions.map(it => retrieveByQuestionId(it.id ?? ''));
    const grouppedTagIds = getTagMapFromQuestions(fileredQuestions as any);
    const promises = grouppedTagIds.map(({ ids, config }) =>
      getRelationsAndKnowledgeById(ids, config.topic, config.subTopic, config.relationDB)
    );
    const relations: RelationRetrieveByTagIdType = [],
      knowledges: KnowledgeRetrieveByTagIdType = [];
    const knowledgeIdSet = new Set<string>();
    await Promise.all(promises).then((res) => {
      for (const resIt of res) {
        relations.push(...resIt.relations);
        for (const it of resIt.knowledges) {
          if (!knowledgeIdSet.has(it.id)) {
            knowledges.push(it);
            knowledgeIdSet.add(it.id);
          }
        }
      }
    });
    const answers = await Promise.all(answerRetrieverPromises).then(it => it.flat());
    return { relations, knowledges, answers };
  }
  const relationsAndKnowledges = await Promise.all(
    detected.map(it => extractIntentsThenDetectTags(question, it.topic, it.subTopic)
      .then((it) => {
        const { tags, config: { relationDB, topic, subTopic } }  = it;
        logDev(() => pc.green(`Detected tags in the ${topic}/${subTopic}:`));
        logDev(() => tags?.map(it => JSON.stringify(it)).join('\n') ?? '');
        return getRelationsAndKnowledgeById(tags.map(it => it.id), topic, subTopic, relationDB);
      })
      .catch((err) => {
        console.error(err);
        return null;
      })
    )
  );
  const relations = [], knowledges: KnowledgeRetrieveByTagIdType = [];
  for (const it of relationsAndKnowledges) {
    if (!it) continue;
    const { relations: itRelations, knowledges: itKnowledges } = it;
    relations.push(...itRelations);
    for (const it of itKnowledges) {
      if (knowledges.find(k => k.id === it.id)) continue;
      knowledges.push(it);
    }
  }
  logDev(() => pc.green('Reranked questions:'));
  logDev(() => rerankedQuestions?.map(it => JSON.stringify(it)).join('\n') ?? '');
  return { answers: [], relations, knowledges };
}

async function extractIntentsThenDetectTags (question: string, topic: string, subTopic: string) {
  const config = checkValidTopicPath(`${topic}/${subTopic}`);
  if (!config) throw new Error('config not found');
  const { tagDB } = config;
  const intentPhraseRes = await retrieveIntentPhrases(question, topic, subTopic);
  const phrases = intentPhraseRes?.phrases ?? [];
  return detectTag(question, phrases, topic, subTopic, tagDB)
    .then(tags => ({ tags, config }));
}

function getTagMapFromQuestions (questions: RetrievedCloseQuestionType) {
  const idsGrouppedByTopicPath: Record<string, { idSet: Set<string>, config: DetectedTopicType }> = {};
  for (const { tags } of questions) {
    if (!tags) continue;
    for (const { tagId, topicPath } of tags) {
      const obj = idsGrouppedByTopicPath[topicPath];
      if (!obj) {
        const config = checkValidTopicPath(topicPath);
        if (!config) continue;
        idsGrouppedByTopicPath[topicPath] = { idSet: new Set([tagId]), config };
      } else {
        obj.idSet.add(tagId);
      }
    }
  }
  return Object.values(idsGrouppedByTopicPath)
    .map(({ idSet, config }) => ({ ids: [...idSet], config }));
}

async function getRelationsAndKnowledgeById (
  tagIdList: string[],
  topic: string,
  subTopic: string,
  relationDB: string,
) {
  const tagIdSet = new Set<string>(...tagIdList);
  const tagIds = [...tagIdSet];
  logDev(() => `tagIds: ${tagIds.join('\n')}`);
  const relationRetrievePromises =
    tagIds.map(it => retrieveRelationByTagId(relationDB, it));
  const knowledgeRetrievePromises =
    tagIds.map(it => retrieveKnowledgeByTagId(topic, subTopic, it));
  const relationIdSet = new Set<string>(),
    knowledgeIdSet = new Set<string>();
  const relations: RelationRetrieveByTagIdType = [],
    knowledges: KnowledgeRetrieveByTagIdType = [];
  await Promise.all([
    ...relationRetrievePromises,
    ...knowledgeRetrievePromises,
  ]).then((res) => {
    for (const resIt of res) {
      for (const it of resIt) {
        if (!it) continue;
        if ('relation' in it && !relationIdSet.has(it.id)) {
          relations.push(it);
          relationIdSet.add(it.id);
        } else if ('summary' in it && !knowledgeIdSet.has(it.id)) {
          knowledges.push(it);
          knowledgeIdSet.add(it.id);
        }
      }
    }
  });
  return { relations, knowledges };
}

async function searchRerankCloseQuestions (
  question: string,
  embedding: number[],
  topicConfig: {
    topic: string,
  subTopic: string
  }[],
  config?: { maxCosineDis?: number, rerankTopk?: number }
) {
  const { maxCosineDis = 0.6, rerankTopk = 8 } = config ?? {};
  const questions = await getCloseQuestionsByEmbedding(embedding, topicConfig);
  const filteredQuestions = questions?.filter(it => Number(it.distance) < maxCosineDis);
  if (!filteredQuestions?.length || filteredQuestions.length === 1) {
    const firstEle = filteredQuestions[0];
    if (!firstEle) return [];
    return [{ ...firstEle, jinaRelvence: 1 - Number(firstEle.distance) }];
  }
  const questionTexts = filteredQuestions.map(it => it.question);
  const rerankRes = await rerankByJina(question, questionTexts, rerankTopk);
  if (!rerankRes) {
    console.error('rerank fails');
    return [];
  };
  const rerankedRes = rerankRes.results
    .map(it => ({ ...filteredQuestions[it.index], jinaRelvence: it.relevance_score }));
  const ret = [];
  for (const it of rerankedRes) {
    if (it) ret.push(it);
  }
  return ret;
}

async function detectTag (
  question: string,
  intentPhrases: string[],
  topic: string,
  subTopic: string,
  tableName: string
) {
  const detectedTags = await getTagDetection(topic, subTopic, [question, ...intentPhrases]);
  if (!detectedTags?.length) return [];
  const typeConfig = getTagTypeConfig(topic, subTopic);
  const promises = detectedTags
    .map(it => searchTagByEmbedding(it.text, it.types, tableName, typeConfig));
  const tags = await Promise.all(promises);
  const filteredTags = [];
  for (const it of tags) {
    if (it) filteredTags.push(it as unknown as Database.Tag.ITag);
  }
  return tagSelection(topic, subTopic, question, filteredTags)
    .then(tags => {
      const set = new Set<string>(), ret = [];
      for (const it of tags ?? []) {
        if (!set.has(it.id)) set.add(it.id), ret.push(it);
      }
      return ret;
    });
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