import { KnowledgeRetrieveByTagIdType } from '../db/knowledge.management';
import { getPrompt } from '../db/prompt.management';
import { RelationRetrieveByTagIdType } from '../db/relation.management';
import { Database } from '../db/typing';

export async function getAnswerGenerationPrompt (
  question: string,
  topic: string,
  subTopic: string,
  knowledges: KnowledgeRetrieveByTagIdType,
  relations: RelationRetrieveByTagIdType
) {
  const systemPrompt = await getPrompt({
    usage: Database.Prompt.Usage.ANSWER_GENERATION,
    topicPath: [topic, subTopic].join('/'),
    role: Database.Prompt.ROLE.SYSTEM
  });
  const system = systemPrompt?.[0]?.content;
  if (!system) throw new Error('error happens in getAnswerGenerationPrompt');
  const relationHeader = [
    'source',
    'source_description',
    'target',
    'target_description',
    'relation',
    'relation_description',
  ].join('|');
  const relationInfo = relations.map((relation) => {
    return [
      relation.source, relation.source_description, relation.target, relation.target_description,
      relation.relation, relation.description
    ].join('|');
  });
  relationInfo.unshift(relationHeader);
  const knowledgeInfo = knowledges
    .map((knowledge) => knowledge.text ?? '')
    .filter(Boolean)
    .map((text, index) => `Concerning Knowledge ${index + 1}:\n${text}`);
  const user = `
Concerning Relations:
${relationInfo.join('\n')}

${knowledgeInfo.join('\n')}

Here is the user question: ${question}
  `
  return {
    system, user
  }
}