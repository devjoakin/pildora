import {
  Map,
  UserRoundX,
  User,
  Globe,
  type LucideIcon,
  CloudSun,
  FileUser,
  BriefcaseBusiness,
} from 'lucide-react';

export type AgentId =
  | 'simpleAgent'
  | 'weatherAgent'
  | 'cvAgent'
  | 'travelAgent'
  | 'webAgent'
  | 'occupationSlackAgent'
  | 'hiringOpsMcpAgent';

export interface AgentUiConfig {
  id: AgentId;
  route: string;
  title: string;
  icon: LucideIcon;
}

export const AGENT_CONFIGS: AgentUiConfig[] = [
  {
    id: 'simpleAgent',
    route: 'agents/simple',
    title: 'Agente simple',
   
    icon: User,
  },
  {
    id: 'webAgent',
    route: 'agents/web',
    title: 'Agente web',
    icon: Globe,
  },
  {
    id: 'weatherAgent',
    route: 'agents/weather',
    title: 'Agente del clima',
    icon: CloudSun,
  },
  {
    id: 'cvAgent',
    route: 'agents/cv',
    title: 'Agente CV',
    icon: FileUser,
  },
  {
    id: 'travelAgent',
    route: 'agents/travel',
    title: 'Agente viajes',
    icon: Map,
  },
  {
    id: 'hiringOpsMcpAgent',
    route: 'agents/hiring-ops-mcp',
    title: 'Agente ocupación MCP',
    icon: UserRoundX,
  },
];
