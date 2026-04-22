import { UserRoundX } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const OCCUPATION_MCP_PAGE_UI: AgentChatUi = {
  badge: 'Ocupación MCP',
  emptyTitle: 'Un solo agente, dos servidores MCP',
  emptyDescription:
    'Este agente combina Postgres MCP para consultas y Slack MCP para publicar mesajes acerca de la ocupacion.',
  placeholder:
    'Ej: Busca usuarios sin ocupacion y publica un resumen en #general',
  icon: UserRoundX,
  suggestions: [
    'Muestrame 5 usuarios de la tabla users',
    'Consulta los usuarios de la tabla users que tienen has_occupation en false',
    'Consulta los usuarios de la tabla users, obtén usuarios que tienen has_occupation en false y publicalo en #general-pildora',
  ],
};

export function OccupationMcpAgentPage() {
  return (
    <AgentChat
      assistantId="occupationMcpAgent"
      ui={OCCUPATION_MCP_PAGE_UI}
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
              title: 'Agente ocupacion con MCP tools',
              language: 'ts',
              code: `
                const tools = await mcpClient.getTools();

                export const occupationMcpAgent = createAgent({
                  model,
                  tools,
                  systemPrompt:
                    'Eres un agente que usa MCP de Postgres y Slack. Para DB, usa query solo 
                    con SELECT. Para publicar en Slack, lista canales con channels_list y 
                    publica con conversations_add_message. No inventes resultados ni 
                    confirmes envios no ejecutados.',
                });`,
            },
          ]}
        />
      }
    />
  );
}
