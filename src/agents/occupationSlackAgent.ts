import { ChatOpenAI } from '@langchain/openai';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { Pool } from 'pg';
import { createAgent, tool } from 'langchain';
import { z } from 'zod/v4';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });
const DEFAULT_MESSAGE = 'Debes rellenar tu ocupacion ya!!';

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

const postgresUrl = getEnv('POSTGRES_URL', 'DATABASE_URL');
const postgresPool = postgresUrl
  ? new Pool({
      connectionString: postgresUrl,
    })
  : null;

const mcpClient = postgresUrl
  ? new MultiServerMCPClient({
      useStandardContentBlocks: true,
      onConnectionError: 'ignore',
      mcpServers: {
        db: {
          transport: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-postgres', postgresUrl],
        },
      },
    })
  : null;

const mcpTools = mcpClient ? await mcpClient.getTools() : [];

type OccupationRecipient = {
  id: string;
  name: string;
  email?: string;
  slack_user_id: string | null;
  has_occupation: boolean;
};

async function fetchUsersMissingOccupation(limit: number) {
  if (!postgresPool) {
    return {
      status: 'error' as const,
      content: 'Missing POSTGRES_URL in .env.',
      recipients: [] as OccupationRecipient[],
    };
  }

  try {
    const result = await postgresPool.query<OccupationRecipient>(
      `
        select id, name, email, slack_user_id, has_occupation
        from users
        where has_occupation = false
          and slack_user_id is not null
        order by id
        limit $1
      `,
      [limit],
    );

    return {
      status: 'success' as const,
      content: `Encontré ${result.rows.length} usuarios con has_occupation=false y slack_user_id cargado.`,
      recipients: result.rows,
    };
  } catch (error) {
    return {
      status: 'error' as const,
      content: `No pude consultar Postgres: ${error instanceof Error ? error.message : 'unknown error'}`,
      recipients: [] as OccupationRecipient[],
    };
  }
}

async function sendSlackReminders({
  recipients,
  message,
  dryRun,
  maxRecipients,
}: {
  recipients: OccupationRecipient[];
  message: string;
  dryRun: boolean;
  maxRecipients: number;
}) {
  const candidates = recipients
    .filter((recipient) => recipient.has_occupation === false)
    .filter((recipient) => Boolean(recipient.slack_user_id))
    .slice(0, maxRecipients);

  if (candidates.length === 0) {
    return {
      status: 'not_found' as const,
      content: 'No hay usuarios validos para notificar.',
      data: undefined,
    };
  }

  if (dryRun) {
    return {
      status: 'dry_run' as const,
      content: `Dry run: enviaria ${candidates.length} mensajes directos en Slack.`,
      data: {
        recipients: candidates,
        message,
      },
    };
  }

  const slackUserToken = getEnv('SLACK_USER_TOKEN');
  if (!slackUserToken) {
    return {
      status: 'error' as const,
      content: 'Missing SLACK_USER_TOKEN in .env.',
      data: undefined,
    };
  }

  const sent: Array<{ id: string; slack_user_id: string }> = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const user of candidates) {
    try {
      const openConversationResponse = await fetch(
        'https://slack.com/api/conversations.open',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${slackUserToken}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ users: user.slack_user_id }),
        },
      );

      const openConversationPayload =
        (await openConversationResponse.json()) as {
          ok?: boolean;
          error?: string;
          channel?: { id?: string };
        };

      const conversationId = openConversationPayload.channel?.id;
      if (
        !openConversationResponse.ok ||
        !openConversationPayload.ok ||
        !conversationId
      ) {
        failed.push({
          id: user.id,
          error:
            openConversationPayload.error ??
            `conversations.open HTTP ${openConversationResponse.status}`,
        });
        continue;
      }

      const sendMessageResponse = await fetch(
        'https://slack.com/api/chat.postMessage',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${slackUserToken}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            channel: conversationId,
            text: message,
          }),
        },
      );

      const sendMessagePayload = (await sendMessageResponse.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!sendMessageResponse.ok || !sendMessagePayload.ok) {
        failed.push({
          id: user.id,
          error:
            sendMessagePayload.error ??
            `chat.postMessage HTTP ${sendMessageResponse.status}`,
        });
        continue;
      }

      sent.push({ id: user.id, slack_user_id: user.slack_user_id as string });
    } catch (error) {
      failed.push({
        id: user.id,
        error: error instanceof Error ? error.message : 'Unknown Slack error',
      });
    }
  }

  return {
    status:
      failed.length > 0 ? ('partial_success' as const) : ('success' as const),
    content: `Slack DM completado. Enviados: ${sent.length}. Fallidos: ${failed.length}.`,
    data: { sent, failed },
  };
}

const getUsersMissingOccupation = tool(
  async ({ limit }) => {
    const query = await fetchUsersMissingOccupation(limit);

    return JSON.stringify({
      status: query.status,
      content: query.content,
      data: {
        recipients: query.recipients,
      },
    });
  },
  {
    name: 'get_users_missing_occupation',
    description:
      'Devuelve usuarios con has_occupation=false y slack_user_id no nulo sin necesidad de escribir SQL.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).default(50),
    }),
  },
);

const notifyUsersInSlack = tool(
  async ({ recipients, message, dryRun, maxRecipients }) => {
    const result = await sendSlackReminders({
      recipients,
      message,
      dryRun,
      maxRecipients,
    });

    return JSON.stringify({
      status: result.status,
      content: result.content,
      data: result.data,
    });
  },
  {
    name: 'notify_users_in_slack',
    description:
      'Envia mensajes directos de Slack con SLACK_USER_TOKEN a recipients filtrados.',
    schema: z.object({
      recipients: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            slack_user_id: z.string().nullable(),
            has_occupation: z.boolean(),
          }),
        )
        .min(1)
        .max(200),
      message: z.string().min(5).default(DEFAULT_MESSAGE),
      dryRun: z.boolean().default(true),
      maxRecipients: z.number().int().min(1).max(50).default(20),
    }),
  },
);

const notifyUsersMissingOccupation = tool(
  async ({ message, dryRun, limit, maxRecipients }) => {
    const query = await fetchUsersMissingOccupation(limit);
    if (query.status === 'error') {
      return JSON.stringify({
        status: 'error',
        content: query.content,
      });
    }

    const notify = await sendSlackReminders({
      recipients: query.recipients,
      message,
      dryRun,
      maxRecipients,
    });

    return JSON.stringify({
      status: notify.status,
      content: notify.content,
      data: {
        matchedUsers: query.recipients.length,
        ...notify.data,
      },
    });
  },
  {
    name: 'notify_users_missing_occupation',
    description:
      'Consulta usuarios sin ocupacion y les envia recordatorio en Slack en un solo paso.',
    schema: z.object({
      message: z.string().min(5).default(DEFAULT_MESSAGE),
      dryRun: z.boolean().default(false),
      limit: z.number().int().min(1).max(200).default(50),
      maxRecipients: z.number().int().min(1).max(50).default(20),
    }),
  },
);

export const occupationSlackAgent = createAgent({
  model,
  tools: [
    ...mcpTools,
    getUsersMissingOccupation,
    notifyUsersInSlack,
    notifyUsersMissingOccupation,
  ] as any,
  systemPrompt:
    'Eres un agente de operaciones. Si el usuario pide algo como "send reminders to users with no occupation", usa notify_users_missing_occupation. Para otras solicitudes, primero llama get_users_missing_occupation para obtener recipients sin SQL y luego notify_users_in_slack. Usa dryRun=true por defecto, salvo cuando el usuario pida explicitamente enviar mensajes (send reminders, envia recordatorios, send now), en cuyo caso usa dryRun=false. Si no hay texto personalizado, usa exactamente: "Debes rellenar tu ocupacion ya!!". No inventes resultados.',
});
