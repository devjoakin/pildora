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
    'Haz plan para hgdfdfsde 3 dias en Berlin y envialo por email',
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
                  tools: [accomodationTool],
                  systemPrompt:
                    'Eres un especialista en alojamiento. 
                    Proporciona recomendaciones de alojamiento basadas en destino, 
                    duración del viaje y presupuesto. Incluye zonas/barrios 
                    sugeridos, tipo de alojamiento y tips de reserva.',
                }); 
                   
                export const askAccommodationSpecialist = tool(
                  async ({ destination, days, budget }) => {
                      const result = await accommodationSpecialist.invoke({
                        messages: [
                          {
                            role: 'user',
                            content: [
                              Recomiendame alojamiento para {destination}.,
                              Duracion: {days} dias.,
                              budget ? Presupuesto: {budget}. : 'Presupuesto: flexible.',
                              'Devuelve: zonas recomendadas, tipo de alojamiento ideal, 
                              rango de precio orientativo por noche y consejos practicos para reservar.',
                            ].join(' '),
                          },
                        ],
                      });
                      
                      const summary = extractTextFromAgentResult(result);
                      return JSON.stringify({
                        status: summary ? 'success' : 'error',
                        content: summary || 'No pude obtener el resumen del alojamiento.',
                      });
                  },
                  {
                      name: 'ask_accommodation_specialist',
                      description:
                        'Ask the accommodation subagent for lodging recommendations before planning.',
                      schema: z.object({
                        destination: z.string().min(2),
                        days: z.number().int().min(1).max(14),
                        budget: z.string().optional(),
                      }),
                    },
                  }
                )
                `,
            },
            {
              title: 'Subagente planificador como tool',
              language: 'ts',
              code: `
                const plannerSpecialist = createAgent({
                  model,
                  tools: [interestsTool],
                  systemPrompt:
                    'Eres un especiliasta en planificador de viajes. 
                    Crea practicos palnes diarios con una estructura
                    de mañana/tarde/noche y una pequeña estimación de presupuesto diario.',
                });
                   
                export const askPlannerSpecialist = tool(
                  async ({ destination, days, budget }) => {
                      const result = await plannerSpecialist .invoke({
                        messages: [
                          {
                            role: 'user',
                            content: [
                              Crea un itinerario para {destination}.,
                              Duracion: {days} dias.,
                              interests ? Intereses: {interests}. : 'Intereses: general.',
                              budget ? Presupuesto: {budget}. : 'Presupuesto: flexible.',
                              accommodationSummary ? Contexto de alojamiento: {accommodationSummary}. : 'Sin contexto de alojamiento disponible.',
                            ].join(' '),
                          },
                        ],
                      });
                      
                      const itinerary = extractTextFromAgentResult(result);
                      return JSON.stringify({
                        status: itinerary ? 'success' : 'error',
                        content: itinerary || 'No pude generar el itinerario.',
                      });
                  },
                  {
                      name: 'ask_planner_specialist',
                      description:
                        destination: z.string().min(2),
                        days: z.number().int().min(1).max(14),
                        interests: z.string().optional(),
                        budget: z.string().optional(),
                        accommodationSummary: z.string().optional(),
                      }),
                    },
                  }
                )
                `,
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
                  'Eres un supervisor de agentes de viajes coordiando subagentes. 
                   Primero obtén el destino y la duración del viaje.
                   En caso de no proporcionar el presupuesto (budget), asume que es medio. 
                   En caso de no poroocionar la duración, asume 5 días.
                   Después llama a ask_accommodation_specialist y ask_planner_specialist 
                   para construir el itinerario final. 
                   Si el usuario solicita enviar o compartir el itinerario por email, 
                   llama a email_trip_plan.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
