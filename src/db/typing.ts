export namespace Database {
  export interface IExternalTag {
    topicPath: `${string},${string}`
    tagId: string
    relationId: string
  }

  export namespace Knowledge {
    export enum Type {
      TEXT = 'TEXT',
      IMAGE = 'IMAGE',
      TABLE = 'TABLE',
      VIDEO = 'VIDEO'
    }

    interface IBaseKnowledge {
      id: string
      summary: string
      tags: IExternalTag[]
      language: string
    }

    export type KnowledgeType = IBaseKnowledge & {
      type: Type.TEXT
      text: string
    } | IBaseKnowledge & {
      type: Type.IMAGE
      url: string
    } | IBaseKnowledge & {
      type: Type.TABLE
      content: string
    } | IBaseKnowledge & {
      type: Type.VIDEO
      url: string
    }
  }

  export interface IQuestion {
    id?: string
    question: string
    question_embedding: string
    thought_text: string
    language: string
    tags: Omit<IExternalTag, 'relationId'>[]
  }

  export namespace Tag {

    export interface ITag {
      id: string
      name: string
      description: string
      types: string[]
      wiki_url?: string
      name_embedding: string
      reference_to?: string
    }
  }

  export namespace Relation {
    export interface IRelation {
      id?: string
      source_id: string
      source_name: string
      source_description: string
      target_description: string
      target_id: string
      target_name: string
      relation: string
      relation_embedding: string
      description: string
      strength: number
    }
  }

  export namespace Prompt {
    export enum ROLE {
      SYSTEM = 'SYSTEM',
      USER = 'USER'
    }

    export enum Usage {
      QUESTION_TAG_DETECTION = 'QUESTION_TAG_DETECTION',
      QUESTION_REWRITE = 'QUESTION_REWRITE',
      QUESTION_TAG_SELECTION = 'QUESTION_TAG_SELECTION',
      ANSWER_GENERATION = 'ANSWER_GENERATION'
    }

    export interface IPrompt {
      id: string
      usage: Usage
      topic_concerning: boolean
      topicPath?: `${string},${string}`
      role: ROLE
      content: string
      description: string
    }
  }

}