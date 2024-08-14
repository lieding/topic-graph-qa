import {API} from '../src/api/typing';

function parseKnowledge (text: string) {
  fetch('http://localhost:3000/api/knowledge/parse-knowledge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, language: 'fr', type: 'TEXT' }),
  })
  .then(res => res.json())
  .then(res => console.dir(res, { depth: 10 }))
  .catch(console.error);
}

//parseKnowledge("Le Clos du Charenton, notre nouvelle résidence arborée au cœur du 12ème arrondissement ! Une multitude de T3 composés chacun d'une grande terrasse ou loggia vous offrant une vue sur les toits de Paris")

function searchCloseNodes (name: string, types: string[]) {
  fetch(`http://localhost:3000/api/editor/REAL_ESTATE/NEW/search-close-nodes?name=${name}&types=${types.join(',')}`)
    .then(res => res.json())
    .then(res => console.dir(res, { depth: 10 }))
    .catch(console.error);
}

// searchCloseNodes('巴黎', ['CITY']);

function addTag (name: string, description: string, types: string[]) {
  fetch('http://localhost:3000/api/editor/REAL_ESTATE/NEW/add-tag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, types }),
  })
  .then(res => res.json())
  .then(res => console.dir(res, { depth: 10 }))
  .catch(console.error);
}

// addTag('巴黎', '巴黎市', ['CITY']);

function addQuestion (
  question: string,
  language: string,
  topic: string,
  subTopic: string,
  id: string,
) {
  const data: API.IQuestionCreation = {
    question,
    thought: '',
    tags: [
      { topic, subTopic, id },
    ],
    language,
  }
  fetch('http://localhost:3000/api/question/add-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
  .then(res => res.json())
  .then(res => console.dir(res, { depth: 10 }))
  .catch(console.error);
}

// addQuestion('Is there anythong to notice in buying old houses in Paris?', 'en', 'REAL_ESTATE', 'SECOND_HAND', '2bcccc6c-10e3-412f-9d96-d45eded109c1')

function searchQuestion  (question: string, topic: string, subTopic: string) {
  const params = new URLSearchParams();
  params.append('question', question);
  params.append('topic', topic);
  params.append('subTopic', subTopic);
  fetch(`http://localhost:3000/api/question/search-rerank-tagdetect-search?${params.toString()}`)
    .then(res => res.json())
    .then(res => console.dir(res, { depth: 10 }))
    .catch(console.error);
}

// searchQuestion('How can I find information about new houses?', 'REAL_ESTATE', 'NEW');
