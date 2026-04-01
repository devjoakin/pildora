import { ChatOpenAI } from '@langchain/openai';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

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
    if (value.length > 0) return value;
  }

  return null;
}

function decodeIfUrlEncoded(value: string | null) {
  if (!value) return null;

  if (!/%[0-9A-Fa-f]{2}/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const postgresUrl = getEnv('POSTGRES_URL', 'DATABASE_URL');
const slackMcpXoxcToken = getEnv('SLACK_MCP_XOXC_TOKEN');
const slackMcpXoxdToken = decodeIfUrlEncoded(getEnv('SLACK_MCP_XOXD_TOKEN'));

const mcpServers: {
  [name: string]: {
    transport: 'stdio';
    command: string;
    args: string[];
    env?: Record<string, string>;
  };
} = {};

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
      SLACK_MCP_XOXD_TOKEN: slackMcpXoxdToken,
      SLACK_MCP_ADD_MESSAGE_TOOL: 'true',
    },
  };
}

const mcpClient =
  Object.keys(mcpServers).length > 0
    ? new MultiServerMCPClient({
        useStandardContentBlocks: true,
        onConnectionError: 'ignore',
        mcpServers,
      })
    : null;

const mcpTools = mcpClient ? await mcpClient.getTools() : [];

export const hiringOpsMcpAgent = createAgent({
  model,
  tools: mcpTools,
  systemPrompt:
    `Eres un agente de Hiring Ops que usa dos MCPs: Postgres y Slack. 
    Para consultar candidatos/usuarios usa el tool query con SQL de solo lectura (solo SELECT). 
    Si vas a enviar una actualizacion por Slack, primero lista canales con channels_list y 
    luego envia con conversations_add_message. Nunca inventes resultados de DB ni confirmes 
    envios que no hayan ocurrido. Si faltan credenciales MCP, explica cuales faltan en .env.`,
});
