import { getEntityRelationExtractPrompt, HeaderMap } from "../prompts/entityRelationExtract";
import { chatCompletion, GroqModel } from "./_groq";


export async function entityRelationExtraction (text: string, language: string) {
  const { user, system, headers } = getEntityRelationExtractPrompt(text);
  let { content, usage } = await chatCompletion(system, user, GroqModel.LLAMA_31_70B);
  if (!content) throw new Error('error happens in entity relation extraction');
  console.log("entity relation extraction raw response");
  console.log(content);
  const colonPos = content.indexOf(':');
  if (colonPos > -1)
    content = content.slice(colonPos + 1);
  const lines = content.split('\n')
    .map(it => it.trim())
    .filter(it => it)
    // @ts-ignore
    .filter(it => !it.startsWith(headers[0]));
  const parsed: HeaderMap[] = [];
  for (const line of lines) {
    const fields = line.split('|');
    const obj = {};
    for (let i = 0; i < fields.length; i++) {
      // @ts-ignore
      obj[headers[i]] = fields[i] ?? '';
    }
    parsed.push(obj as HeaderMap);
  }
  return { parsed, usage };
}