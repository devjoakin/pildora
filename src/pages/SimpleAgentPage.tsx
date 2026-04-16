import { User } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const SIMPLE_PAGE_UI: AgentChatUi = {
  badge: 'Agente simple',
  emptyTitle:
    'Pregunta por cualquier cosa o tema de actualidad',
  emptyDescription:
    'Este agente es un simple wrapper alrededor de un LLM.',
  placeholder: 'Ej: ¿Cuantos años tiene la Tierra?',
  icon: User,
   suggestions: [
    '¿Qué es React.js?',
    '¿Qué tiempo hace en Alicante?',
    '¿Quien ganó el último Open de Australia de tenis?',
  ],
};

export function SimpleAgentPage() {
  return (
    <AgentChat
      assistantId="simpleAgent"
      ui={SIMPLE_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente simple"
          items={[
            {
              title: 'Creacion del simpleAgent',
              language: 'ts',
              code: `
              import { createAgent } from 'langchain';
              import { ChatOpenAI } from '@langchain/openai';

              const model = new ChatOpenAI({
                model: 'gpt-4o-mini',
              });
              
              export const simpleAgent = createAgent({
                model,
                systemPrompt:
                  'Eres un asistente que puede proporcionar información acerca
                  de cualquier cosa o tema de actualidad.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
