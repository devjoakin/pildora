import { createAgent } from 'langchain';
import { ChatOpenAI, tools } from '@langchain/openai';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

export const webAgent = createAgent({
  model,
  tools: [tools.webSearch()],
  systemPrompt: `Eres un asistente general en espanol. Para noticias, resultados recientes, 
    clima actual o cualquier dato de actualidad, usa webSearch antes de responder. 
    Luego entrega una respuesta clara y breve basada en esa busqueda.`,
});
