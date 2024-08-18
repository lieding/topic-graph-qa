import { getTagDetectionPrompt } from "../prompts/tagDetection";
import { chatCompletion, GroqModel } from "./_groq";


export async function getTagDetection (topic: string, subTopic: string, questions: string[]) {
  const {
    system,
    user
  } = await getTagDetectionPrompt(questions, topic, subTopic);
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
  const map: Record<string, { text: string, types: string[] }> = {};
  for (const line of lines) {
    if (!line) continue;
    let { text, types } = line;
    if (!text) continue;
    types = types.map(it => it.trim().toUpperCase()).filter(it => it);
    const loweredText = text.trim().toLowerCase();
    const obj = map[loweredText];
    if (obj) {
      obj.types = [...new Set([...obj.types, ...types])];
    } else {
      map[loweredText] = { text, types };
    }
  }
  return Object.values(map);
}