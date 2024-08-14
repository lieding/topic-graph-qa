import TopicConfig from '../../TopicConfig.json';

export function getTopicDetectionPrompt (text: string) {
  const topics: {
    name: string,
    description: string,
    subTopics: {name: string, description: string}[]
  }[] = [];
  for (const topic in TopicConfig) {
    const { description, subtopics } = TopicConfig[topic as keyof typeof TopicConfig];
    const subTopics = Object.entries(subtopics)
      .map(([name, obj]) => ({ name, description: (obj as any).description }));
    if (description && subTopics.length > 0) {
      topics.push({
        name: topic,
        description,
        subTopics
      });
    }
  }
  let allTopicLines: string[] = [];
  for (const { name: topicName, subTopics } of topics) {
    for (const { name, description } of subTopics) {
      allTopicLines.push(`${topicName}_${name}: ${description}`);
    }
  }
  return {
    system: `
      You are an experienced topic detection assistant. You need to classify the topics of text.
      ATTENTION the text might include multiple topics.
      ONLY RETURN THE OUTPUT TOPIC NAMES, SPLITTED BY ','.
      IF NO TOPIC MATCHES, RETURN 'NONE'.
    `,
    user: `ALL TOPICS:\n${allTopicLines.join('\n')}\nINPUT TEXT:\n${text}`,
    topics
  }
}