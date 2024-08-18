import { getPrompt } from "../db/prompt.management";
import { Database } from "../db/typing";

const system = `
You are an AI assistant tasked with extracting important words or phrases from input questions.
Your goal is to identify all important points of the input questions.
For each extracted objects, try categorize them respectively into types.
OUTPUT THE RESULTS IN CSV FORMAT. DO NOT RETURN ANY OTHER INFORMATION.
`;

export async function getTagDetectionPrompt (
  questions: string[],
  topic: string,
  subTopic: string,
) {
  const res = await getPrompt({
    usage: Database.Prompt.Usage.QUESTION_TAG_DETECTION,
    topicPath: [topic, subTopic].join('/'),
  });
  const content = res?.[0]?.content ?? null;
  if (!content) throw new Error('error happens in getTagDetectionPrompt');
  const user = `
  ${content}

  Input questions:
  ${questions.join('\n')}
  Output:
  `
  return {
    system,
    user
  };
}