import { getRawEmbedding as getRawEmbeddingByVoyageAI } from '../src/embedding/voyageai';
import { answerGeneration } from '../src/llm/answerGeneration';
import { KnowledgeRetrieveByTagIdType } from '../src/db/knowledge.management';
import { RelationRetrieveByTagIdType } from '../src/db/relation.management';
import { topicDetection } from '../src/llm/topicDetection';
import TopicConfig from '../TopicConfig.json';

function generateAwswer (
  question: string,
  topic: string,
  subTopic: string,
  knowledges: KnowledgeRetrieveByTagIdType,
  relations: RelationRetrieveByTagIdType
) {
  answerGeneration(question, 'en', topic, subTopic, knowledges, relations)
}

// generateAwswer(
//   'Where can I live in Lyon?',
//   'REAL_ESTATE',
//   'NEW',
//   [
//     {
//       summary: 'As a leader in the French market,TEST IMMO is THE reference for furnished rentals ',
//       language: 'en',
//       text: 'TEST IMMO has been much more than a real estate agency for 25 years. As a leader in the French market, TEST IMMO is THE reference for furnished rentals thanks to its unique DNA, 100% digital and 100% human.\n' +
//         'TEST IMMO is a real estate agency that has been offering properties for rent or sale in Paris, Lyon, Bordeaux, Aix-en-Provence, Montpellier, and Toulouse since 1999.\n' +
//         'Specializing in furnished rentals, TEST IMMO caters to an international clientele looking for furnished apartments for professional or non-touristic personal stays (studies, medical reasons, etc.) in Paris, Aix-en-Provence, Bordeaux, Lyon, Montpellier, Toulouse, and other major cities in France.\n' +
//         'The purpose of TEST IMMO? To be the trusted partner that secures and simplifies real estate by offering expert, agile, and accessible service to people here and abroad.'
//     }
//   ],
//   [
//     {
//       relation: 'LOCATE_IN',
//       description: 'The real estate agent to to sell new houses in Paris',
//       target: 'Paris',
//       target_description: 'international city, the capital of France',
//       source: 'TEST IMMO',
//       source_description: 'Real estate agency to sell houses'
//     },
//     {
//       relation: 'LOCATE_IN',
//       description: 'new residence located in Paris, 12th arrondissement',
//       target: 'Paris',
//       target_description: 'international city, the capital of France',
//       source: 'PASSAGE SAINT MANDE',
//       source_description: 'new residence located in the heart of the 12th arrondissement of the capital'
//     }
//   ],
// )

function doTopicDetection (question: string, language: string) {
  console.log('Current Topic/Subtopic configuration:');
  console.dir(TopicConfig, { depth: 10 });
  console.log('user question: ', question);
  topicDetection(question, language)
    .then(res => console.dir(res, { depth: 10 }));
}

// doTopicDetection('In Paris, buying houses and renting, which is better?', 'en')
