import { CloudSun } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const WEATHER_PAGE_UI: AgentChatUi = {
  badge: 'Weather Agent',
  heading: 'Consulta clima en tiempo real',
  emptyTitle: 'Pregunta por el clima de cualquier ciudad',
  emptyDescription:
    'Este agente combina herramientas en tiempo real para responder de forma precisa.',
  placeholder: 'Ej: ¿Qué tiempo hace en Valencia?',
  icon: CloudSun,
  suggestions: [
    '¿Qué tiempo hace en Alicante?',
    '¿Qué tiempo hace en Madrid?',
    '¿Qué tiempo hace en Sydney?',
  ],
};

export function WeatherAgentPage() {
  return (
    <AgentChat
      assistantId="weatherAgent"
      ui={WEATHER_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente clima"
          items={[
            {
              title: 'Tool get_weather',
              language: 'ts',
              code: `
              export const getWeather = tool(
                async ({ location }) => {
                  const geoResponse = await fetch(
                    \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(location)}&count=1\`,
                  );
                  const geoData = await geoResponse.json();
                  // ... obtener coordenadas y clima
                  return JSON.stringify({ status: 'success', content: 'Weather in ...' });
                },
                {
                  name: 'get_weather',
                  schema: z.object({ location: z.string() }),
                },
              );`,
            },
            {
              title: 'Creacion del weatherAgent',
              language: 'ts',
              code: `
              export const weatherAgent = createAgent({
                model,
                tools: [getWeather, tools.webSearch()],
                systemPrompt:
                  'Eres un asistente que puede proporcionar información meteorológica actual para cualquier ubicación utilizando la herramienta get_weather, y también puede realizar búsquedas web si es necesario.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
