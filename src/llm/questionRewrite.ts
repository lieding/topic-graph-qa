import { getQuestionRewritePrompt } from "../prompts/questionRewrite";
import { deepbrickChatCompletion, DeepbrickModel } from "./_deepbrick";

export async function rewriteQuestion (question: string, topic: string, subTopic: string) {
  const res = await getQuestionRewritePrompt(question, topic, subTopic);
  if (!res) throw new Error('error happens in finding prompt');
  const { system, user } = res;
  const chatResponse =
    await deepbrickChatCompletion(system, user, DeepbrickModel.GPT4MINI);
  if (!chatResponse) throw new Error('error happens in question rewrite');
  const content = chatResponse.content;
  if (!content) throw new Error('error happens in question rewrite');
  const lines = content.split('\n')
    .filter(it => it)
    .map(it => it.trim().split('|'))
    .filter(it => !it[0]?.includes('id'));
  const ret = [];
  for (const line of lines){
    const generated = line[1];
    generated && ret.push(generated);
  }
  return ret;
}