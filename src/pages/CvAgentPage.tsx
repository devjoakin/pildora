import { FileUser } from 'lucide-react';
import { AgentChat, type AgentChatUi } from '../components/AgentChat';
import { CodeSnippetSection } from '../components/CodeSnippetSection';

const EMAIL_PAGE_UI: AgentChatUi = {
  badge: 'Agente CV',
  emptyTitle: 'Haz preguntas sobre el contenido del CV',
  emptyDescription:
    'Este agente lee el PDF de tu curriculum y responde con esa base. Si no encuentra la respuesta, enviará un email de seguimiento.',
  placeholder: 'Ej: ¿Cuántos años de experiencia tengo en frontend?',
  icon: FileUser,
  suggestions: [
    '¿Qué stack uso actualmente?',
    '¿En qué proyectos he trabajado recientemente?',
    '¿Cuál es mi experiencia en TypeScript y React?',
  ],
};

export function CvAgentPage() {
  return (
    <AgentChat
      assistantId="cvAgent"
      ui={EMAIL_PAGE_UI}
      snippetSection={
        <CodeSnippetSection
          title="Como se implementa el agente CV"
          items={[
            {
              title: 'Busqueda en CV (RAG basico)',
              language: 'ts',
              code: `
              export const searchCurriculum = tool(
                async ({ question }) => {
                  try {
                    const vectorStore = await getCvVectorStore();
                    const matches = await vectorStore.similaritySearchWithScore(question, 4);

                    if (matches.length === 0) {
                      return toolResponse(
                        'not_found',
                        'No encontré información suficiente en el CV para responder 
                        con confianza.',
                      );
                    }
                    ....

                    const context = matches
                      .map(
                        ([doc, score]: [DocumentInterface, number], index: number) =>
                          "[Fragmento " + (index + 1) + " | 
                           score=" + score.toFixed(3) + "] " + doc.pageContent,
                      )
                      .join('');
                    return toolResponse('found', context)
                    
                  } catch (error) {
                    return toolResponse(
                      'error',
                      error instanceof Error
                        ? 'No se pudo leer o indexar el CV: ' + error.message
                        : 'No se pudo leer o indexar el CV.',
                    );
                  }
                },
                {
                  name: 'search_curriculum',
                  schema: z.object({ question: z.string().min(3) }),
                },
              );`,
            },
            {
              title: 'Envío de email con Resend',
              language: 'ts',
              code: `
              export const sendEmail = tool(
                async ({ question }) => {
                  const resend = new Resend(process.env.RESEND_API_KEY);
                  const { data, error } = await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'user@example.com',
                    subject: 'Nueva pregunta sin respuesta del agente CV',
                    html: \`<p>Pregunta sin respuesta:</p><blockquote>\${question}</blockquote>\`,
                  });
                  return JSON.stringify(
                    error ? 
                      { status: 'error', content: error.message } : 
                      { status: 'success', data });
                },
                { 
                  name: 'send_email', 
                  schema: z.object({ question: z.string().min(3) }) 
                },
              );`,
            },
            {
              title: 'Creacion del cvAgent',
              language: 'ts',
              code: `
              export const cvAgent = createAgent({
                model,
                tools: [searchCurriculum, sendEmail],
                systemPrompt:
                  'Eres un asistente que responde preguntas exclusivamente basadas en el CV 
                  del usuario.  Primero llama a search_curriculum. Si devuelve status found, 
                  responde solo con esos fragmentos sin inventar datos. Si devuelve status 
                  not_found o no es suficiente para responder con confianza, llama a send_email 
                  con la pregunta y luego informa que se ha enviado un email de seguimiento.',
              });`,
            },
          ]}
        />
      }
    />
  );
}
