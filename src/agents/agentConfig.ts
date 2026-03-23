import { CloudSun, Github, Mail, Map, type LucideIcon } from 'lucide-react';

export type AgentId =
  | 'weatherAgent'
  | 'emailAgent'
  | 'travelAgent'
  | 'githubIssuesAgent';

export interface AgentUiConfig {
  id: AgentId;
  route: string;
  title: string;
  badge: string;
  heading: string;
  emptyTitle: string;
  emptyDescription: string;
  placeholder: string;
  icon: LucideIcon;
  suggestions: string[];
}

export const AGENT_CONFIGS: AgentUiConfig[] = [
  {
    id: 'weatherAgent',
    route: 'agents/weather',
    title: 'Agente clima',
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
  },
  {
    id: 'emailAgent',
    route: 'agents/email',
    title: 'Agente CV',
    badge: 'CV Agent',
    heading: 'Responde sobre mi curriculum',
    emptyTitle: 'Haz preguntas sobre el contenido del CV',
    emptyDescription:
      'Este agente lee el PDF de tu curriculum y responde con esa base. Si no encuentra la respuesta, enviará un email de seguimiento.',
    placeholder: 'Ej: ¿Cuántos años de experiencia tengo en frontend?',
    icon: Mail,
    suggestions: [
      '¿Qué stack uso actualmente?',
      '¿En qué proyectos he trabajado recientemente?',
      '¿Cuál es mi experiencia en TypeScript y React?',
    ],
  },
  {
    id: 'travelAgent',
    route: 'agents/travel',
    title: 'Agente viajes',
    badge: 'Travel Agent',
    heading: 'Planifica viajes con subagentes',
    emptyTitle: 'Crea itinerarios usando clima + planner + email',
    emptyDescription:
      'Este ejemplo usa un supervisor con subagentes especializados para clima, plan diario y envio por email.',
    placeholder:
      'Ej: Planea 3 dias en Lisboa con presupuesto medio y enviamelo',
    icon: Map,
    suggestions: [
      'Planea 2 dias en Barcelona para comida y arquitectura',
      'Crea un itinerario de 4 dias en Roma con presupuesto ajustado',
      'Genera plan para Paris y enviamelo por email',
    ],
  },
  {
    id: 'githubIssuesAgent',
    route: 'agents/github-issues',
    title: 'Agente GitHub',
    badge: 'GitHub Issues Agent',
    heading: 'Crea y busca issues con IA',
    emptyTitle: 'Triage de issues para tu repositorio',
    emptyDescription:
      'Este agente analiza solicitudes, busca posibles duplicados y crea issues estructurados en GitHub.',
    placeholder: 'Ej: Crea un issue para agregar login con Google',
    icon: Github,
    suggestions: [
      'Busca issues abiertos sobre autenticacion',
      'Crea un bug report para error al iniciar sesion',
      'Genera un issue de enhancement para modo oscuro',
    ],
  },
];

export const AGENT_CONFIG_BY_ID = AGENT_CONFIGS.reduce<
  Record<AgentId, AgentUiConfig>
>(
  (acc, config) => {
    acc[config.id] = config;
    return acc;
  },
  {} as Record<AgentId, AgentUiConfig>,
);
