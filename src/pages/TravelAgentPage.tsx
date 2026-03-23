import { Map } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const TRAVEL_PAGE_UI: AgentChatUi = {
  badge: 'Travel Agent',
  heading: 'Planifica viajes con subagentes',
  emptyTitle: 'Supervisor + subagentes en una sola experiencia',
  emptyDescription:
    'El supervisor coordina subagentes de clima, plan diario y envio por email para responder mejor.',
  placeholder: 'Ej: Planea 3 dias en Lisboa para pareja foodie y enviamelo',
  icon: Map,
  suggestions: [
    'Planea un finde de 2 dias en Sevilla',
    'Itinerario de 5 dias en Tokio con presupuesto medio',
    'Haz plan para Berlin y envialo por email',
  ],
};

export function TravelAgentPage() {
  return (
    <AgentChat
      assistantId="travelAgent"
      ui={TRAVEL_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el supervisor con subagentes"
          items={[
            {
              title: 'Subagente de clima como tool',
              language: 'ts',
              code: `const weatherSpecialist = createAgent({
  model,
  tools: [getWeather],
  systemPrompt: 'You are a weather specialist...',
});

export const askWeatherSpecialist = tool(
  async ({ destination }) => {
    const result = await weatherSpecialist.invoke({
      messages: [{ role: 'user', content: \`Consulta el clima de \${destination}\` }],
    });
    return JSON.stringify({ status: 'success', content: extractTextFromAgentResult(result) });
  },
  { name: 'ask_weather_specialist', schema: z.object({ destination: z.string() }) },
);`,
            },
            {
              title: 'Supervisor que orquesta subagentes',
              language: 'ts',
              code: `export const travelAgent = createAgent({
  model,
  tools: [askWeatherSpecialist, askPlannerSpecialist, emailTripPlan],
  systemPrompt:
    'First call weather + planner subagents. If user asks, send itinerary via email.',
});`,
            },
          ]}
        />
      }
    />
  );
}
