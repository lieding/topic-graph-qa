import { Database } from "../db/typing";

function getSystemPrompt (subTopic: string) {
  if (subTopic)
    return `You are a helpful knowledge summary assistant. The topic of text is ${subTopic}. The SUMMARY MUST BE IN ENGLISH AND LIMITED TO 60 WORDS. ONLY RETURN SUMMARY CONTENT.`;
  return `You are a helpful knowledge summary assistant. The SUMMARY MUST BE IN ENGLISH AND LIMITED TO 60 WORDS. ONLY RETURN SUMMARY CONTENT.`
}


export function getKnowledgeSummaryPrompt (type: Database.Knowledge.Type, subTopic: string, content: string) {
  if (type === Database.Knowledge.Type.TEXT) {
    return {
      system: getSystemPrompt(subTopic),
      user: `You must write a summary of the content: ${content}.`
    };
  }

  if (type === Database.Knowledge.Type.IMAGE) {
    return null;
  }

  if (type === Database.Knowledge.Type.TABLE) {
    return null;
  }

  if (type === Database.Knowledge.Type.VIDEO) {
    return null;
  }

  return null;
  
}