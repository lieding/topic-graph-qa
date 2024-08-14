
export enum DeepbrickModel {
  GPT4MINI = 'gpt-4o-mini',
}

const DEEPBRICKS_API_KEY = process.env.DEEPBRICKS_API_KEY;

interface IResponse {
  id: string // "chatcmpl-rbkkNdvaFJlQ1Hp3BENlkqByETsRIU7I",
  object: string // "chat.completion",
  created: number // 1716513310,
  model: string // "gpt-4-turbo",
  choices: {
    index: number // 0,
    finish_reason: "stop",
    message: {
      content: string // "Hello! How can I assist you today?",
      role: "assistant"
    },
    logprobs: null
  }[],
  usage: {
    prompt_tokens: number // 2,
    completion_tokens: number // 9,
    total_tokens: number // 11
  }
}

export function deepbrickChatCompletion (system: string, user: string, model: DeepbrickModel, temperature = 1) {
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
  return fetch('https://api.deepbricks.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPBRICKS_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature }),
  })
    .then(res => res.json())
    .then((res: IResponse) => ({ content: res?.choices?.[0]?.message.content, usage: res?.usage }))
    .catch(console.error);
}