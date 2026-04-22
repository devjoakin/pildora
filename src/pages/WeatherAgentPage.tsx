import { CloudSun } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const WEATHER_PAGE_UI: AgentChatUi = {
  badge: 'Agente del Clima',
  emptyTitle: 'Pregunta por el clima de cualquier ciudad',
  emptyDescription:
    'Este agente combina herramientas en tiempo real para responder de forma precisa.',
  placeholder: 'Ej: ¿Qué tiempo hace en Valencia? ¿Cómo están las noticias?',
  icon: CloudSun,
  suggestions: [
    '¿Qué clima hace en Tokyo?',
    '¿Qué tiempo hace en Alicante?',
    '¿Qué temperatura hace en Madrid?',
  ],
};

export function WeatherAgentPage() {
  return (
    <AgentChat
      assistantId="weatherAgent"
      ui={WEATHER_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente weather"
          items={[
            {
              title: 'Tool get_weather',
              language: 'ts',
              code: `
              import { tool } from 'langchain';

              export const getWeather = tool(
                async ({ location }) => {
                  const geoResponse = await fetch(
                    \`https://geocoding-api.open-meteo.com/v1/search?
                    name=\${encodeURIComponent(location)}&count=1\`,
                  );
                  const geoData = await geoResponse.json();
                  const { latitude, longitude, name, country } = geoData.results[0];
                  const weatherResponse = await fetch(
                    \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}
                    &longitude=\${longitude}&current=temperature_2m,weather_code\`
                  );
                  const weatherData = await weatherResponse.json();
                  // ...map weather codes to descriptions...
                  return JSON.stringify(
                    { 
                      status: 'success', 
                      content: \`El tiempo en \${name}, \${country} 
                              es \${weatherData.current.temperature_2m}°C\` 
                    }
                  );
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
                tools: [getWeather],
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
