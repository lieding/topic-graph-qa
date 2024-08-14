import { Database } from '../db/typing';
import { getKnowledgeSummaryPrompt as getPrompt } from '../prompts/knowledgeSummary';
import { chatCompletion, GroqModel } from './_groq';


export async function getKnowledgeSummary (type: Database.Knowledge.Type, subTopic: string, content: string) {
  const prompt = getPrompt(type, subTopic, content);
  if (!prompt) return null;
  const res = await chatCompletion(prompt.system, prompt.user, GroqModel.LLAMA_31_8B);
  if (!res?.content) return null;
  return {
    summary: res.content,
    usage: res.usage
  };
}