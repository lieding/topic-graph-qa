import { intentPhraseRetrievalPrompt } from "../prompts/intentPhraseRetrieval";
import { chatCompletion, GroqModel } from "./_groq";

export async function retrieveIntentPhrases (question: string, topic: string, subTopic: string) {
  const {system, user} = await intentPhraseRetrievalPrompt(question, topic, subTopic);
  const res = await chatCompletion(system, user, GroqModel.LLAMA_31_70B);
  if (!res?.content) return null;
  const phrases = res.content.split('\n').map(it => it.trim()).filter(it => it);
  return { phrases, usage: res.usage };
}