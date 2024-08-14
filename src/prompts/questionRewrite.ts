import { getPrompt } from "../db/prompt.management";
import { Database } from "../db/typing";

export async function getQuestionRewritePrompt (
  question: string,
  topic: string,
  subTopic: string,
) {
  const res = await getPrompt({
    usage: Database.Prompt.Usage.QUESTION_REWRITE,
    topicPath: `${topic},${subTopic}`
  });
  const content = res?.[0]?.content;
  if (!content) return null;
  return {
    system: `
    You are an experienced and professional AI assistant.
    Based on input question, you have to generate at least 5 new questions which have the same semantic meaning, but in different words.
    OUTPUT IN CSV FORMAT AND DO NOT RETURN ANY OTHER INFORMATION.
    `,
    user: `
    ${content}

    Such is input question: ${question}
    Output:
    id|generation
    `
  };
}