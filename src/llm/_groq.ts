import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

const client = new Groq({
  apiKey
});

export enum GroqModel {
  LLAMA_31_70B = 'llama-3.1-70b-versatile',
  LLAMA_31_8B = 'llama-3.1-8b-instant',
} 

export async function chatCompletion (system: string, user: string, model: GroqModel, config?: {
  temperature?: number
}) {
  const chatResponse = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: system
      },
      {
        role: 'user',
        content: user
      }
    ],
    temperature: config?.temperature ?? 0.01
  });
  const usage = chatResponse.usage;
  const content = chatResponse.choices?.[0]?.message.content;
  return { usage, content };
}