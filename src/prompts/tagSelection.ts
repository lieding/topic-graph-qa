import { getPrompt } from "../db/prompt.management";
import { Database } from "../db/typing";

const System = `
You are an very experienced and professional AI assistant. Now you need to select the nodes which are related to the input question.
ONLY OUTPUT THE ID OF THR NODE. DO NOT RETURN ANY OTHER INFORMATION.
`

export async function getTagSelectionPrompt (
  topic: string,
  subTopic: string,
  question: string,
  tags: Database.Tag.ITag[]
) {
  const res = await getPrompt({
    usage: Database.Prompt.Usage.QUESTION_TAG_SELECTION,
    topicPath: `${topic},${subTopic}`
  });
  const content = res?.[0]?.content;
  if (!content) return null;
  const nodes = tags.map((tag, id) => ({ id, node: tag.name, description: tag.description }));
  const nodeInfo = nodes.map(it => [it.id, it.node, it.description].join('|')).join('\n');
  const user = `
  ${content}

  Input question: ${question}
  Input Nodes:
  id|node|description
  ${nodeInfo}
  `
  return {
    system: System,
    user
  };
}