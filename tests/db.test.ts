import { getCloseTagByEmbedding } from "../src/db/tag.management";
import { retrieveByTagId as retrieveRelationByTagId } from "../src/db/relation.management";
import { retrieveByTagId } from '../src/db/knowledge.management'
import { getTagTypeConfig } from '../src/utils';
import { getTextRawEmbedding } from '../src/embedding/openai';
import { getCloseQuestionsByEmbedding } from '../src/db/question.management';
import { getRawEmbedding as getRawEmbeddingByVoyageAI } from '../src/embedding/voyageai'

async function searchCloseTags (name: string, types: string[]) {
  const tableName = 'realestate_new_tag';
  const typeConfig = getTagTypeConfig('REAL_ESTATE', 'NEW');
  const filteredTypes = types.filter(type => typeConfig.includes(type));
  const embedding = (await getTextRawEmbedding([name]))[0];
  getCloseTagByEmbedding(tableName, filteredTypes, embedding, 5)
    .then(res => console.dir(res, { depth: 10 }));
}

// searchCloseTags('巴黎', [])

function retrieveKnowledge (topic: string, subTopic: string, tagId: string) {
  retrieveByTagId(topic, subTopic, tagId)
    .then(res => console.dir(res, { depth: 10 }));
}

// retrieveKnowledge('REAL_ESTATE', 'NEW', '2bcccc6c-10e3-412f-9d96-d45eded109c1')

function retrieveRelation (tableName: string, tagId: string) {
  retrieveRelationByTagId(tableName, tagId)
    .then(res => console.dir(res, { depth: 10 }));
}

// retrieveRelation('realestate_new_relation', '2bcccc6c-10e3-412f-9d96-d45eded109c1')

async function searchCloseQuestions (question: string, topic: string, subTopic: string) {
  const embedding = await getRawEmbeddingByVoyageAI(question);
  if (!embedding) throw new Error('embedding fails');
  console.log("input question: ", question);
  getCloseQuestionsByEmbedding(embedding, [{ topic, subTopic }])
    .then(res => console.dir(res, { depth: 10 }));
}

searchCloseQuestions('How can I find new houses?', 'REAL_ESTATE', 'NEW')