import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

export const simpleAgent = createAgent({
  model,
  systemPrompt:
    'Eres un asistente que puede proporcionar información acerca de cualqeuir cosa o tema de actualidad.',
});
