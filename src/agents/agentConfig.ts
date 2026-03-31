import {
  Map,
  UserRoundX,
  User,
  Globe,
  type LucideIcon,
  CloudSun,
  FileUser,
} from 'lucide-react';

export type AgentId =
  | 'simpleAgent'
  | 'weatherAgent'
  | 'cvAgent'
  | 'travelAgent'
  | 'webAgent'
  | 'occupationSlackAgent';

export interface AgentUiConfig {
  id: AgentId;
  route: string;
  title: string;
  heading: string;
  icon: LucideIcon;
}

export const AGENT_CONFIGS: AgentUiConfig[] = [
  {
    id: 'simpleAgent',
    route: 'agents/simple',
    title: 'Agente Simple',
    heading: 'Consulta cualquier cosa',
    icon: User,
  },
  {
    id: 'webAgent',
    route: 'agents/web',
    title: 'Agente Web',
    heading: 'Consulta información en línea',
    icon: Globe,
  },
  {
    id: 'weatherAgent',
    route: 'agents/weather',
    title: 'Agente Weather',
    heading: 'Consulta clima en tiempo real',
    icon: CloudSun,
  },
  {
    id: 'cvAgent',
    route: 'agents/cv',
    title: 'Agente CV',
    heading: 'Responde sobre mi curriculum',
    icon: FileUser,
  },
  {
    id: 'travelAgent',
    route: 'agents/travel',
    title: 'Agente viajes',
    heading: 'Planifica viajes con subagentes',
    icon: Map,
  },
  {
    id: 'occupationSlackAgent',
    route: 'agents/occupation-slack',
    title: 'Agente ocupacion',
    heading: 'Consulta usuarios y envia mensajes en Slack',
    icon: UserRoundX,
  },
];
