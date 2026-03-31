import { Globe } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const WEB_PAGE_UI: AgentChatUi = {
  badge: 'Web Agent',
  heading: 'Consulta  noticias en tiempo real',
  emptyTitle: 'Pregunta  por noticias actuales',
  emptyDescription:
    'Este agente utiliza herramientas de búsqueda web para obtener información actualizada y responder de forma precisa.',
  placeholder: 'Ej: ¿Dime las últimas noticias?',
  icon: Globe,
  suggestions: [
    '¿Qué es React.js?',
    '¿Qué tiempo hace en Alicante?',
    '¿Quien ganó el último Open de Australia de tenis?',
  ],
};

export function WebAgentPage() {
  return (
    <AgentChat
      assistantId="webAgent"
      ui={WEB_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente web"
          items={[
            {
              title: 'Creacion del webAgent',
              language: 'ts',
              code: `
              export const webAgent = createAgent({
                model,
                tools: [tools.webSearch()],
                systemPrompt:
                  'Eres un asistente que puede proporcionar información meteorológica actual 
                  para cualquier ubicación utilizando la herramienta get_weather, y también 
                  puede realizar búsquedas web si es necesario.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
