import { getTagDetectionPrompt } from "../prompts/tagDetection";
import { chatCompletion, GroqModel } from "./_groq";


export async function getTagDetection (topic: string, subTopic: string, question: string) {
  const {
    system,
    user
  } = await getTagDetectionPrompt(question, topic, subTopic);
  const { content } = await chatCompletion(system, user, GroqModel.LLAMA_31_70B);
  if (!content) return null;
  let lines = content.split('\n')
    .map(it => it.trim())
    .filter(it => it && !it.startsWith('text'))
    .map(it => {
      const fields = it.split('|');
      const text = fields[0]?.trim();
      const types = fields[1]?.split(',').map(it => it.trim()) ?? [];
      if (!text) return null;
      return { text, types };
    });
  if (!lines || lines.length === 0) return null;
  const parsedLines = [];
  for (const line of lines) {
    if (!line) continue;
    const { text, types } = line;
    if (!text) continue;
    parsedLines.push({ text, types });
  }
  return parsedLines;
}