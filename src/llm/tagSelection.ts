
import { Database } from "../db/typing";
import { getTagSelectionPrompt } from "../prompts/tagSelection";
import { deepbrickChatCompletion, DeepbrickModel } from "./_deepbrick";

export async function tagSelection (topic: string, subTopic: string, question: string, tags: Database.Tag.ITag[]) {
  const res = await getTagSelectionPrompt(topic, subTopic, question, tags);
  if (!res) return null;
  const content = await deepbrickChatCompletion(res.system, res.user, DeepbrickModel.GPT4MINI, 0.01)
    .then(res => res?.content);
  if (!content) return [];
  const idxs = content.match(/([\d]{1,3})/g)?.map(it => Number(it));
  if (!idxs) return [];
  return tags.filter((_, idx) => idxs.includes(idx));
}