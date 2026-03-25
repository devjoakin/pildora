import {
  Info,
  Mail,
  Map,
  UserRoundX,
  User,
  type LucideIcon,
} from 'lucide-react';

export type AgentId =
  | 'simpleAgent'
  | 'infoAgent'
  | 'emailAgent'
  | 'travelAgent'
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
    id: 'infoAgent',
    route: 'agents/info',
    title: 'Agente Info',
    heading: 'Consulta clima y noticias en tiempo real',
    icon: Info,
  },
  {
    id: 'emailAgent',
    route: 'agents/email',
    title: 'Agente CV',
    heading: 'Responde sobre mi curriculum',
    icon: Mail,
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
