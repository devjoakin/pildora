import { Github } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const GITHUB_ISSUES_PAGE_UI: AgentChatUi = {
  badge: 'GitHub Issues Agent',
  heading: 'Triage automatico de issues',
  emptyTitle: 'Busca duplicados y crea issues de calidad',
  emptyDescription:
    'Ideal para convertir feedback en tickets accionables con formato consistente.',
  placeholder: 'Ej: Crea un issue para mejorar performance del dashboard',
  icon: Github,
  suggestions: [
    'Busca issues sobre performance en el repo',
    'Crea un issue para error al enviar formulario',
    'Crea un issue de docs para setup local',
  ],
};

export function GithubIssuesAgentPage() {
  return (
    <AgentChat
      assistantId="githubIssuesAgent"
      ui={GITHUB_ISSUES_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente de GitHub Issues"
          items={[
            {
              title: 'Tool para buscar issues',
              language: 'ts',
              code: `export const searchGithubIssues = tool(
  async ({ query, state }) => {
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: \`repo:\${owner}/\${repo} is:issue \${state ?? 'open'} \${query}\`,
      per_page: 5,
    });
    return JSON.stringify({ status: 'success', content: formatSearch(data.items) });
  },
  { name: 'search_github_issues', schema: z.object({ query: z.string(), state: z.enum(['open', 'closed', 'all']).optional() }) },
);`,
            },
            {
              title: 'Tool para crear issue',
              language: 'ts',
              code: `export const createGithubIssue = tool(
  async ({ title, body, labels }) => {
    const { data } = await octokit.rest.issues.create({ owner, repo, title, body, labels });
    return JSON.stringify({ status: 'success', url: data.html_url, number: data.number });
  },
  { name: 'create_github_issue', schema: z.object({ title: z.string(), body: z.string(), labels: z.array(z.string()).optional() }) },
);`,
            },
          ]}
        />
      }
    />
  );
}
