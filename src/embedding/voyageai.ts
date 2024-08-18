interface IVoyageAIEmbeddingResponse {
  "object": "list",
  data: {
    object: "embedding",
    embedding: number[] //,
    index: number // 0
  }[],
  model: string // "voyage-large-2",
  usage: {
    total_tokens: number // 10
  }
}


const voyageai_api_key = process.env.VOYAGEAI_API_KEY;

export function getRawEmbedding (text: string) {
  return fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${voyageai_api_key}`
    },
    body: JSON.stringify({
      "input": text,
      "model": "voyage-multilingual-2",
      "input_type": "document"
    })
  })
    .then(res => res.json())
    .then((res: IVoyageAIEmbeddingResponse) => res.data?.[0]?.embedding)
    .catch(console.error);
}