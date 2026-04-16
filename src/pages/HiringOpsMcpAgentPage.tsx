import { BriefcaseBusiness } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const HIRING_OPS_MCP_PAGE_UI: AgentChatUi = {
  badge: 'Hiring Ops MCP',
  emptyTitle: 'Un solo agente, dos servidores MCP',
  emptyDescription:
    'Este agente combina Postgres MCP para consultas y Slack MCP para publicar resúmenes operativos.',
  placeholder:
    'Ej: Busca usuarios sin ocupacion y publica un resumen en #general',
  icon: BriefcaseBusiness,
  suggestions: [
    'Muestrame 5 usuarios de la tabla users',
    'Cuantos usuarios tienen has_occupation=false?',
    'Resume usuarios sin ocupacion y publicalo en #general-pidlora',
  ],
};

export function HiringOpsMcpAgentPage() {
  return (
    <AgentChat
      assistantId="hiringOpsMcpAgent"
      ui={HIRING_OPS_MCP_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Orquestación con dos MCP"
          items={[
            {
              title: 'Config de servers MCP',
              language: 'ts',
              code: `
                const mcpClient = new MultiServerMCPClient({
                  mcpServers: {
                    db: {
                      transport: 'stdio',
                      command: 'npx',
                      args: [
                        '-y', 
                        '@modelcontextprotocol/server-postgres', 
                        process.env.POSTGRES_URL!
                      ],
                    },
                    slack: {
                      transport: 'stdio',
                      command: 'npx',
                      args: ['-y', 'slack-mcp-server@latest', '--transport', 'stdio'],
                      env: {
                        SLACK_MCP_XOXC_TOKEN: process.env.SLACK_MCP_XOXC_TOKEN!,
                        SLACK_MCP_XOXD_TOKEN: process.env.SLACK_MCP_XOXD_TOKEN!,
                        SLACK_MCP_ADD_MESSAGE_TOOL: 'true',
                      },
                    },
                  },
              });`,
            },
            {
              title: 'Supervisor hiring ops',
              language: 'ts',
              code: `const tools = await mcpClient.getTools();

export const hiringOpsMcpAgent = createAgent({
  model,
  tools,
  systemPrompt:
    'Usa query para DB y conversations_add_message para publicar en Slack',
});`,
            },
          ]}
        />
      }
    />
  );
}
