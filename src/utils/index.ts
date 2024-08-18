import TopicConfig from '../../TopicConfig.json';
import TagTypeConfig from '../../TagTypeConfig.json';
import { IS_DEV } from '../config';

export function parseSearchString (searchStr: string): Record<string, string | undefined> {
  if (!searchStr) return {};
  if (searchStr.startsWith('?')) searchStr = searchStr.slice(1);
  // searchStr = decodeURIComponent(searchStr);
  const params = new URLSearchParams(searchStr);
  const ret = {};
  for (const it of params) {
    // @ts-ignore
    ret[it[0]] = it[1];
  }
  return ret;
}

export function getTopicDBConfig (topic: string, subtopic: string) {
  // @ts-ignore
  const config = TopicConfig?.[topic]?.subtopics?.[subtopic] as {
    tag_db_name: string,
    relation_db_name: string
  } | null;
  if (!config) throw new Error('db config not found');
  return config;
}

export function checkValidTopicPath (path: `${string},${string}` | `${string}/${string}`) {
  let topic, subTopic;
  if (path.includes('/')) {
    [topic, subTopic] = path.split('/');
  } else if (path.includes(',')) {
    [topic, subTopic] = path.split(',');
  }
  if (!topic || !subTopic) return null;
  const dbConfig = getTopicDBConfig(topic, subTopic);
  if (dbConfig)
    return { topic, subTopic, tagDB: dbConfig.tag_db_name, relationDB: dbConfig.relation_db_name };
  return null;
}

export function checkTextWordCnt (text: string, isZH = false) {
  const textt = text.replaceAll('\n', '').trim();
  if (isZH) return textt.length;
  return textt.split(' ').length;
}

export function getTagTypeConfig (topic: string, subTopic: string) {
  // @ts-ignore
  const config = TagTypeConfig?.[`${topic},${subTopic}`] as string[] | null;
  if (!config) throw new Error('db config not found');
  return config;
}

export function logDev (fun: () => string) {
  if (!IS_DEV) return;
  console.log(fun());
}