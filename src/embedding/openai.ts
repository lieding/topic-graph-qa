import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function getTextEmbeddings(texts: string[]) {
  const embeddingResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  const embeddings = 
    embeddingResp.data.map((e) => '[' + e.embedding + ']');

  return embeddings;
}

export function getTextRawEmbedding (texts: string[]) {
  return openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  })
  .then(res => res.data.map(e => e.embedding));
}