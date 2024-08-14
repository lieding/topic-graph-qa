import { getPrompt } from "../db/prompt.management";
import { Database } from "../db/typing";

export async function getTagDetectionPrompt (
  question: string,
  topic: string,
  subTopic: string,
) {
  const system = `
    You are an AI assistant tasked with extracting important words or phrases from input question.
    Your goal is to identify all important points of the input question.
    For each extracted objects, try categorize them respectively into types.
    OUTPUT THE RESULTS IN CSV FORMAT. DO NOT RETURN ANY OTHER INFORMATION.
  `;
  const res = await getPrompt({
    usage: Database.Prompt.Usage.QUESTION_TAG_DETECTION,
    topicPath: [topic, subTopic].join('/'),
  });
  const content = res?.[0]?.content ?? null;
  if (!content) throw new Error('error happens in getTagDetectionPrompt');
  return {
    system,
    user: `
      ${content}

      Input question: ${question}
      Output:
    `
  };
}