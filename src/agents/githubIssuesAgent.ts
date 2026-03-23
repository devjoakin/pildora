import { Octokit } from '@octokit/rest';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, tool } from 'langchain';
import { z } from 'zod/v4';

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
    if (value) return value;
  }

  return null;
}

function getGithubClient() {
  const token = getEnv('GITHUB_TOKEN');
  const owner = getEnv('GITHUB_OWNER');
  const repo = getEnv('GITHUB_REPO');

  if (!token || !owner || !repo) {
    return {
      error:
        'Missing GITHUB_TOKEN, GITHUB_OWNER or GITHUB_REPO. Set them in .env and restart npm run dev:server.',
    } as const;
  }

  return {
    octokit: new Octokit({ auth: token }),
    owner,
    repo,
  } as const;
}

export const searchGithubIssues = tool(
  async ({ query, state }) => {
    const client = getGithubClient();
    if ('error' in client) {
      return JSON.stringify({ status: 'error', content: client.error });
    }

    const { octokit, owner, repo } = client;
    const searchParts = [
      `repo:${owner}/${repo}`,
      'is:issue',
      state ? `state:${state}` : '',
      query,
    ].filter(Boolean);

    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: searchParts.join(' '),
      sort: 'updated',
      order: 'desc',
      per_page: 5,
    });

    const formatted = data.items
      .filter((item) => !('pull_request' in item))
      .map((item) => `#${item.number} - ${item.title} (${item.state})`)
      .join('\n');

    if (!formatted) {
      return JSON.stringify({
        status: 'not_found',
        content: 'No encontré issues que coincidan con ese criterio.',
      });
    }

    return JSON.stringify({
      status: 'success',
      content: formatted,
    });
  },
  {
    name: 'search_github_issues',
    description:
      'Search issues in the configured GitHub repository to avoid duplicates.',
    schema: z.object({
      query: z.string().min(3),
      state: z.enum(['open', 'closed', 'all']).optional(),
    }),
  },
);

export const createGithubIssue = tool(
  async ({ title, body, labels }) => {
    const client = getGithubClient();
    if ('error' in client) {
      return JSON.stringify({ status: 'error', content: client.error });
    }

    const { octokit, owner, repo } = client;
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
    });

    return JSON.stringify({
      status: 'success',
      content: `Issue creado: #${data.number} ${data.title}`,
      url: data.html_url,
      number: data.number,
    });
  },
  {
    name: 'create_github_issue',
    description:
      'Create a GitHub issue in the configured repository with title, body and labels.',
    schema: z.object({
      title: z.string().min(6).max(140),
      body: z.string().min(20),
      labels: z.array(z.string()).optional(),
    }),
  },
);

export const githubIssuesAgent = createAgent({
  model,
  tools: [searchGithubIssues, createGithubIssue],
  systemPrompt:
    'Eres un agente de triage para GitHub. Antes de crear un issue, intenta buscar duplicados con search_github_issues. Si el usuario confirma crearlo, usa create_github_issue con una descripcion bien estructurada (Contexto, Problema, Solucion propuesta, Criterios de aceptacion). Responde en espanol.',
});
