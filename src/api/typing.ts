import type { CloseTagSearchItemType } from "../db/tag.management";
import { Database } from "../db/typing";

export namespace API {
  export interface IRelation {
    source: string
    sourceId: string
    sourceDesc: string
    target: string
    targetId: string
    targetDesc: string
    relation: string
    relationDesc: string
    strength: number
  }

  export interface ITag {
    name: string
    description: string
    types: string[]
    wikiUrl?: string
  }

  export interface IRelatedTag {
    topic: string
    subTopic: string
    id: string
  }

  export interface IKnowledgeCreation {
    tags: (IRelatedTag & { relationId: string })[]
    summary: string
    type: string
    language: string
    content?: string
    url?: string
    text?: string
  }

  export interface IQuestionCreation {
    question: string
    thought: string
    language: string
    tags: IRelatedTag[]
  }

  export interface IUsage {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }

  export namespace Knowledge {
    export interface ISummary {
      type: Database.Knowledge.Type
      text: string
      language: string
    }
  }

  export namespace Editor {
    export interface CloseNodesSearchResponse {
      nodes: CloseTagSearchItemType
    }
  }
}

export function checkValidKnowledgeType (type: any): type is Database.Knowledge.Type {
  return Object.values(Database.Knowledge.Type).includes(type);
}

export function checkValidKnowledge (data: unknown): data is API.IKnowledgeCreation {
  const { type, language, tags, text, summary } = data as any;
  if (!checkValidKnowledgeType(type)) return false;
  if (!language) return false;
  if (!tags?.length) return false;
  if (!summary) return false;
  for (const tag of (tags as API.IKnowledgeCreation['tags'])) {
    if (!tag.id || !tag.topic || !tag.subTopic || !tag.relationId) return false;
  }
  if (type === Database.Knowledge.Type.TEXT && text && typeof text === 'string') {
    return true;
  }
  return false;
}

export function checkValidTag (tag: any): tag is API.ITag {
  if (!tag || typeof tag !== 'object') return false;
  return 'name' in tag && 'description' in tag && 'types' in tag;
}

export function checkValidRelation (relation: any): relation is API.IRelation {
  if (!relation || typeof relation !== 'object') return false;
  return 'source' in relation && 'sourceId' in relation && 'sourceDesc' in relation
    && 'target' in relation && 'targetId' in relation && 'targetDesc' in relation
    && 'relation' in relation && 'relationDesc' in relation && 'strength' in relation;
}
