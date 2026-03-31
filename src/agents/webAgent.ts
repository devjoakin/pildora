import { createAgent, } from 'langchain';
import { ChatOpenAI, tools } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

export const webAgent = createAgent({
  model,
  tools: [ tools.webSearch()],
  systemPrompt:
    'Eres un asistente general en espanol.  Usa webSearch si se requiere informacion actualizada.',
});
