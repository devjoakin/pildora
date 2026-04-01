import { Map } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const TRAVEL_PAGE_UI: AgentChatUi = {
  badge: 'Agente de viajes',
  heading: 'Planifica viajes con subagentes',
  emptyTitle: 'Supervisor + subagentes en una sola experiencia',
  emptyDescription:
    'El supervisor coordina subagentes de alojamiento, plan diario y envio por email para responder mejor.',
  placeholder: 'Ej: Planea 3 dias en Lisboa para pareja foodie y enviamelo',
  icon: Map,
  suggestions: [
    'Planea un finde de 2 dias en Sevilla',
    'Itinerario de 5 dias en Tokio con presupuesto medio',
    'Haz plan para de 3 dias en Berlin y envialo por email',
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
              title: 'Subagente de alojamiento como tool',
              language: 'ts',
              code: `
                const accommodationSpecialist = createAgent({
                  model,
                  tools: [],
                  systemPrompt: 'You are an accommodation specialist...',
                });

                export const askAccommodationSpecialist = tool(
                  async ({ destination, days, budget }) => {
                    const result = await accommodationSpecialist.invoke({
                    messages: [{ 
                      role: 'user', 
                       content: \`Recomiendame alojamiento en \${destination}\` 
                      }],
                    });
                    return JSON.stringify({ 
                      status: 'success', 
                      content: extractTextFromAgentResult(result) 
                    });
                  },
                  { 
                    name: 'ask_accommodation_specialist', 
                    schema: z.object({ destination: z.string(), days: z.number(), budget: z.string().optional() }) 
                  },
                );`,
            },
            {
              title: 'Supervisor que orquesta subagentes',
              language: 'ts',
              code: `
              export const travelAgent = createAgent({
                model,
                tools: [
                  askAccommodationSpecialist, 
                  askPlannerSpecialist, 
                  emailTripPlan
                ],
                systemPrompt:
                  'First call accommodation + planner subagents. 
                  If user asks, send itinerary via email.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
