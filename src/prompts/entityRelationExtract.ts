const SystemPrompt = `
  You are an AI assistant tasked with extracting entities and relations from a piece of text. Your goal is to identify all entities and related relations.
  Remember there can be multiple direct (explicit) or implied relationships between the same pair of nodes.
  Attention, when your encounter the personal pronoun, like I, you, he, she , it , they or like 'this company' and 'that person', try inferrring the real name based on context, if not, just ignore.
  OUTPUT MUST BE IN PURE CSV FORMAT, DO NOT RETURN ANY OTHER INFORMATION.
`;

const HeaderMap = {
  source: 'The name of the source entity',
  source_type: 'The type of the entity, like PERSON, LOCATION, COMPANY, EVENT, TIME',
  source_description: 'The description of the source entity ',
  target: 'The name of the target entity',
  target_type: 'The type of the entity, like PERSON, LOCATION, COMPANY, EVENT, TIME',
  target_description: 'The description of the target entity',
  relation_type: 'The type of relationship (e.g., FATHER_OF, SON_OF, HAPPEN_IN, LOCATED_IN)',
  relation_description: 'A brief explanation of the relationship',
  strength: 'An integer score between 1 to 10, indicating the strength or importance of the relationship'
} as const;

const FieldsStr = Object.entries(HeaderMap).map(([key, value]) => `- ${key}: ${value}`).join('\n');

const HeaderArr = Object.keys(HeaderMap);

const HeaderLine = HeaderArr.join('|');

export type HeaderMap = Record<keyof typeof HeaderMap, string>;

export function getEntityRelationExtractPrompt (text: string) {
  const user = `
    Output fields:
    ${FieldsStr}

    Example:
    Input:
    In 2004, Musk was an early investor who provided most of the initial financing in electric vehicle manufacturer Tesla Motors, Inc. (later Tesla, Inc.). He assumed the position of the company's chairman.
    ${HeaderLine}
    INVESTMENT|EVENT|make initial financing in Tesla Motors|2014|TIME|HAPPEN_IN|the investment happens in 2014|3
    MUSK|PERSON|Elon MUSK, a successful businessman|Tesla Motors|COMPANY|MAKE_INVESTMENT|Elson MUSH maked investmant in Tesla|5
    MUSK|PERSON|Elon MUSK, a successful businessman|chairman|POSITION|a top position in the company|ASSUME|MUSK assumed chairman of Tesla|5

    Here is the input text: ${text}
    Output:
    ${HeaderLine}
  `;
  return {
    system: SystemPrompt,
    user,
    headers: HeaderArr,
  };
}