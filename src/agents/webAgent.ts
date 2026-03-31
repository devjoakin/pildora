import { createAgent, tool } from 'langchain';
import { ChatOpenAI, tools } from '@langchain/openai';
import { z } from 'zod/v4';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

function extractTextFromAgentResult(result: unknown) {
  if (!result || typeof result !== 'object') return '';

  const maybeMessages = (result as { messages?: unknown }).messages;
  if (!Array.isArray(maybeMessages) || maybeMessages.length === 0) {
    return '';
  }

  const lastMessage = maybeMessages[maybeMessages.length - 1] as {
    content?: unknown;
  };
  const { content } = lastMessage;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(
        (block): block is { type: 'text'; text: string } =>
          typeof block === 'object' &&
          block !== null &&
          'type' in block &&
          block.type === 'text' &&
          'text' in block &&
          typeof block.text === 'string',
      )
      .map((block) => block.text)
      .join('\n')
      .trim();
  }

  return '';
}

const webSearchSpecialist = createAgent({
  model,
  tools: [tools.webSearch()],
  systemPrompt:
    'Eres un especialista de busqueda web. Usa webSearch para obtener informacion actualizada y responde en espanol con una respuesta breve y util.',
});

export const webSearch = tool(
  async ({ query }) => {
    const result = await webSearchSpecialist.invoke({
      messages: [{ role: 'user', content: query }],
    });

    const summary = extractTextFromAgentResult(result);
    return JSON.stringify({
      status: summary ? 'success' : 'error',
      content: summary || 'No pude obtener resultados de la busqueda web.',
    });
  },
  {
    name: 'web_search',
    description:
      'Buscar informacion actualizada en la web para responder al usuario.',
    schema: z.object({
      query: z.string().min(3),
    }),
  },
);

export const webAgent = createAgent({
  model,
  tools: [webSearch],
  systemPrompt:
    'Eres un asistente general en espanol. Para noticias, resultados recientes, clima actual o cualquier dato de actualidad, SIEMPRE usa ask_web_search antes de responder. Luego entrega una respuesta clara y breve basada en esa busqueda.',
});
