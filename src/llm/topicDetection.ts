import { getTopicDetectionPrompt } from '../prompts/topicDetection';
import { chatCompletion, GroqModel } from './_groq';

export async function topicDetection (text: string, language: string) {
  const { system, user, topics } = getTopicDetectionPrompt(text);
  let { content } = await chatCompletion(system, user, GroqModel.LLAMA_31_8B);
  if (!content) throw new Error('error happens in topic detection');
  content = content.toUpperCase();
  if (content.includes('NONE')) return null;
  const topicNames = content.split(',').map(it => it.trim());
  if (!topicNames || topicNames.length === 0) return null;
  const detectedTopics: { topic: string, subTopic: string, description: string }[] = [];
  for (const topicName of topicNames) {
    const topic = topics.find(it => topicName.startsWith(it.name));
    if (!topic) continue;
    const subTopic = topic.subTopics.find(it => topicName.endsWith(it.name));
    if (!subTopic) continue;
    detectedTopics.push({
      topic: topic.name,
      subTopic: subTopic.name,
      description: subTopic.description
    });
  }
  if (!detectedTopics.length) return null;
  return detectedTopics;
}