import { AutoCompleteProps } from 'antd';
import { API } from '../../../../src/api/typing';
import { Database } from '../../../../src/db/typing';
import { RemoteEndpoint } from '../../config';


export function summarizeTextKnowledge (text: string, language: string) {
  const data: API.Knowledge.ISummary =
    { text, language, type: Database.Knowledge.Type.TEXT };
  return fetch(`${RemoteEndpoint}/api/knowledge/summarize-knowledge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
  .then(res => res.json())
  .then(res => res as { summary: string, usage: API.IUsage } | null)
  .catch(console.error);
}

export function searchCloseNodes (topic: string, subTopic: string, name: string, types: string[]) {
  return fetch(`${RemoteEndpoint}/api/editor/${topic}/${subTopic}/search-close-nodes?name=${name}&types=${types.join(',')}`)
    .then(res => res.json())
    .then(res => res as API.Editor.CloseNodesSearchResponse | null)
    .catch(console.error);
}

export function insertNode (topic: string, subTopic: string, data: API.ITag) {
  return fetch(`${RemoteEndpoint}/api/editor/${topic}/${subTopic}/add-tag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(res => res as { insertedId: string } | null)
    .catch(console.error);
}

export function insertRelation (topic: string, subTopic: string, data: API.IRelation) {
  return fetch(`${RemoteEndpoint}/api/editor/${topic}/${subTopic}/add-relation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(res => res as { insertedId: string } | null)
    .catch(console.error);
}

export function insertKnowledge (data: API.IKnowledgeCreation) {
  return fetch(`${RemoteEndpoint}/api/knowledge/add-knowledge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .catch(console.error);
}

export const DefaultRelationType: AutoCompleteProps['options'] = [
  { label: 'LOCATE_IN, for the location, organization', value: 'LOCATE_IN' },
  { label: 'HAPPEN_IN, for the happening time of event', value: 'HAPPEN_IN' },
  { label: 'EVENT', value: 'EVENT' },
  { label: 'FRIEND_OF', value: 'FRIEND_OF' },
  { label: 'FAMILY_OF', value: 'FAMILY_OF' },
]