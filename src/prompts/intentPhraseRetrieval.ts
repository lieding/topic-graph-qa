import { getPrompt } from "../db/prompt.management";
import { Database } from "../db/typing";

const system = `
Suppose you are a question analyzer and your task is to extract the underlying user intents from the input question. You should understand and transform each extracted user intent into multiple simple phrases. ATTENTION EACH SINGLE INTENT CAN GENERATE MULTIPLE PHRASES TO ENHANCE FURTHER MATCHES.
You should carefully read the given user question to understand its different intents.
EACH PHRASE IS IN SEPARATE LINE AND DO NOT RETURN ANY OTHER INFORMATION.
`;

export async function intentPhraseRetrievalPrompt (question: string, topic: string, subTopic: string) {
  const res = await getPrompt({
    usage: Database.Prompt.Usage.INTENT_PHRASE_RETRIEVAL,
    topicPath: `${topic},${subTopic}`
  });
  const content = res?.[0]?.content;
  if (!content) throw new Error('error happens in intentPhraseRetrievalPrompt');
  const user = `
Input Question: ${question}
Output:
  `
  return {
    system,
    user
  };
}