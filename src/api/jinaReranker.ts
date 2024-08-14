
const JINA_API_KEY = process.env.JINA_API_KEY;

export interface JinaRerankResponse {
  model: string // "jina-reranker-v2-base-multilingual",
  usage: {
    total_tokens: number // 815,
    prompt_tokens: number // 815
  },
  results: {
    index: number // 0,
    document: {
      text: string // "Organic skincare for sensitive skin with aloe vera and chamomile: Imagine the soothing embrace of nature with our organic skincare range, crafted specifically for sensitive skin. Infused with the calming properties of aloe vera and chamomile, each product provides gentle nourishment and protection. Say goodbye to irritation and hello to a glowing, healthy complexion."
    },
    relevance_score: number // 0.8783142566680908
  }[]
}

export function rerankByJina (query: string, documents: string[], topk = 5) {
  if (documents.length < 2)
    throw new Error('Jina rerank needs at least two documents');
  const data = {
    model: "jina-reranker-v2-base-multilingual",
    query,
    top_n: topk,
    documents,
  }
  return fetch('https://api.jina.ai/v1/rerank', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(res => res as JinaRerankResponse)
    .catch(console.error);
}