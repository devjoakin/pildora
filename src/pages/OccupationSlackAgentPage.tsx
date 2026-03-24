import { UserRoundX } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const OCCUPATION_SLACK_PAGE_UI: AgentChatUi = {
  badge: 'Occupation + Slack Agent',
  heading: 'Segmenta usuarios y notifica por Slack',
  emptyTitle: 'Consulta usuarios con hasOccupation=false',
  emptyDescription:
    'Este agente usa MCP preconstruido para Postgres (Neon) y envia DMs en Slack usando SLACK_USER_TOKEN.',
  placeholder:
    'Ej: Busca usuarios sin ocupacion y envia el mensaje a los primeros 2',
  icon: UserRoundX,
  suggestions: [
    'Send reminders to users with no occupation',
    'Busca usuarios sin ocupacion y muestrame candidatos',
    'Haz dry run de envio en Slack para todos los candidatos',
    'Envia mensaje real a los primeros 2 candidatos',
  ],
};

export function OccupationSlackAgentPage() {
  return (
    <AgentChat
      assistantId="occupationSlackAgent"
      ui={OCCUPATION_SLACK_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el flujo DB + Slack"
          items={[
            {
              title: 'MCP client con dos servidores',
              language: 'ts',
              code: `const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    db: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', process.env.POSTGRES_URL!],
    },
  },
});

const mcpTools = await mcpClient.getTools();`,
            },
            {
              title: 'Tool helper sin SQL en prompt',
              language: 'ts',
              code: `const getUsersMissingOccupation = tool(
  async ({ limit }) => {
    const rows = await pool.query(
      'select id, name, email, slack_user_id, has_occupation from users where has_occupation = false and slack_user_id is not null limit $1',
      [limit],
    );
    return JSON.stringify({ data: { recipients: rows.rows } });
  },
  { name: 'get_users_missing_occupation' },
);`,
            },
          ]}
        />
      }
    />
  );
}
