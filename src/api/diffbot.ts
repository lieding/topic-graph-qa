import diffbot2 from '@api/diffbot-2';

const DIFFBOT_API_TOKEN = process.env.DIFFBOT_API_TOKEN;
diffbot2.auth(DIFFBOT_API_TOKEN ?? '');

export async function detectEntities (content: string, lang: string) {
  const res = await diffbot2.postV1([
      {
        lang,
        format: 'plain text',
        customSummary: {maxNumberOfSentences: 3},
        content,
      }
    ],
    {fields: ['entities', 'categories', 'summary', 'facts']}
  )
    .then(({ data }) => data);
  console.dir(res, {depth: 10});
}