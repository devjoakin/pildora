import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const slackMcpXoxcToken = process.env.SLACK_MCP_XOXC_TOKEN;
const slackMcpXoxdToken = process.env.SLACK_MCP_XOXD_TOKEN;

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const mcpServers: ConstructorParameters<
  typeof MultiServerMCPClient
>[0]['mcpServers'] = {};

if (postgresUrl) {
  mcpServers.db = {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', postgresUrl],
  };
}

if (slackMcpXoxcToken && slackMcpXoxdToken) {
  mcpServers.slack = {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'slack-mcp-server@latest', '--transport', 'stdio'],
    env: {
      SLACK_MCP_XOXC_TOKEN: slackMcpXoxcToken,
      SLACK_MCP_XOXD_TOKEN: safeDecode(slackMcpXoxdToken),
      SLACK_MCP_ADD_MESSAGE_TOOL: 'true',
    },
  };
}

const tools =
  Object.keys(mcpServers).length > 0
    ? await new MultiServerMCPClient({
        useStandardContentBlocks: true,
        onConnectionError: 'ignore',
        mcpServers,
      }).getTools()
    : [];

export const occupationMcpAgent = createAgent({
  model,
  tools,
  systemPrompt:
    'Eres un agente que usa MCP de Postgres y Slack. Para DB, usa query solo con SELECT. Para publicar en Slack, lista canales con channels_list y publica con conversations_add_message. No inventes resultados ni confirmes envios no ejecutados. Si falta configuracion, indica que variables faltan en .env.',
});
