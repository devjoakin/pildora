import { ChatOpenAI } from '@langchain/openai';
import { createAgent, tool } from 'langchain';
import { Resend } from 'resend';
import { z } from 'zod/v4';
import { getWeather } from './weatherAgent';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

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

function cleanEnvValue(value: string) {
  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  return unquoted.replace(/^Bearer\s+/i, '').trim();
}

function getEnv(...names: string[]) {
  for (const name of names) {
    const raw = process.env[name];
    if (!raw) continue;
    const value = cleanEnvValue(raw);
    if (value) return value;
  }

  return null;
}

const weatherSpecialist = createAgent({
  model,
  tools: [getWeather],
  systemPrompt:
    'You are a weather specialist. Use get_weather and return concise weather information in Spanish.',
});

const itinerarySpecialist = createAgent({
  model,
  tools: [],
  systemPrompt:
    'You are a travel itinerary specialist. Create practical day-by-day plans in Spanish with morning/afternoon/night structure and a short budget estimate.',
});

export const askWeatherSpecialist = tool(
  async ({ destination }) => {
    const result = await weatherSpecialist.invoke({
      messages: [
        {
          role: 'user',
          content: `Consulta el clima actual para ${destination} y dame un resumen util para planificar viaje.`,
        },
      ],
    });

    const summary = extractTextFromAgentResult(result);
    return JSON.stringify({
      status: summary ? 'success' : 'error',
      content: summary || 'No pude obtener el resumen del clima.',
    });
  },
  {
    name: 'ask_weather_specialist',
    description:
      'Ask the weather subagent for destination weather context before planning.',
    schema: z.object({
      destination: z.string().min(2),
    }),
  },
);

export const askPlannerSpecialist = tool(
  async ({ destination, days, interests, budget, weatherSummary }) => {
    const result = await itinerarySpecialist.invoke({
      messages: [
        {
          role: 'user',
          content: [
            `Crea un itinerario para ${destination}.`,
            `Duracion: ${days} dias.`,
            interests ? `Intereses: ${interests}.` : 'Intereses: general.',
            budget ? `Presupuesto: ${budget}.` : 'Presupuesto: flexible.',
            weatherSummary
              ? `Contexto de clima: ${weatherSummary}.`
              : 'Sin contexto de clima disponible.',
            'Responde en espanol con secciones Dia 1, Dia 2, etc. y recomendaciones accionables.',
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
      'Ask the itinerary subagent to create a travel plan using user constraints and weather context.',
    schema: z.object({
      destination: z.string().min(2),
      days: z.number().int().min(1).max(14),
      interests: z.string().optional(),
      budget: z.string().optional(),
      weatherSummary: z.string().optional(),
    }),
  },
);

export const emailTripPlan = tool(
  async ({ destination, itinerary }) => {
    const apiKey = getEnv('RESEND_API_KEY', 'VITE_RESEND_API_KEY');
    const recipient = getEnv(
      'TRAVEL_PLAN_EMAIL',
      'CV_FALLBACK_EMAIL',
      'RESEND_FALLBACK_EMAIL',
    );

    if (!apiKey) {
      return JSON.stringify({
        status: 'error',
        content:
          'Missing RESEND_API_KEY (or VITE_RESEND_API_KEY). Set it in .env and restart npm run dev:server.',
      });
    }

    if (!recipient) {
      return JSON.stringify({
        status: 'error',
        content:
          'Missing TRAVEL_PLAN_EMAIL (or CV_FALLBACK_EMAIL/RESEND_FALLBACK_EMAIL). Set it in .env and restart npm run dev:server.',
      });
    }

    const sender = getEnv('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [recipient],
      subject: `Itinerario de viaje para ${destination}`,
      html: `<h2>Itinerario para ${destination}</h2><pre>${itinerary}</pre>`,
    });

    if (error) {
      return JSON.stringify({
        status: 'error',
        content: `No pude enviar el email: ${error.message}`,
      });
    }

    return JSON.stringify({
      status: 'success',
      content: `Itinerario enviado por email a ${recipient}.`,
      data,
    });
  },
  {
    name: 'email_trip_plan',
    description:
      'Send the generated travel plan by email when the user asks for delivery.',
    schema: z.object({
      destination: z.string().min(2),
      itinerary: z.string().min(20),
    }),
  },
);

export const travelAgent = createAgent({
  model,
  tools: [askWeatherSpecialist, askPlannerSpecialist, emailTripPlan],
  systemPrompt:
    'You are a supervisor travel agent coordinating subagents. First gather destination and trip length. Then call ask_weather_specialist and ask_planner_specialist to build the final itinerary. If the user asks to send or share the itinerary by email, call email_trip_plan. Always respond in Spanish and do not claim actions you did not execute.',
});
