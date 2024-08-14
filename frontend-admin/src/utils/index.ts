import TopicConfig from '../../../TopicConfig.json';

export function getTopicConfig () {
  const ret: {
    topic: string,
    description: string,
    subTopics: {subTopic: string, description: string}[]
  }[] = [];
  Object.entries(TopicConfig).forEach(([topic, config]) => {
    const { description, subtopics } = config;
    const subTopics = Object.entries(subtopics)
      .map(([subTopic, obj]) => ({ subTopic, description: obj.description }));
    ret.push({
      topic, description, subTopics
    })
  });
  return ret;
}

export function debounce (func: (...args: any[]) => any, wait: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func(...args), wait);
  };
}