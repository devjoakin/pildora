import { useStream } from '@langchain/langgraph-sdk/react';
import type { weatherAgent } from './agents/weatherAgent';
import { MessageInput } from './components/MessageInput';
import { EmptyState } from './components/EmptyState';
import { AlertCircle, Wrench } from 'lucide-react';
import type { Message } from '@langchain/langgraph-sdk';
import { ToolCallCard } from './components/ToolCallCard';
import { MessageBubble } from './components/MessageBubble';
import { LoadingIndicator } from './components/Loading';
import { useStickToBottom } from 'use-stick-to-bottom';

const TOOL_AGENT_SUGGESTIONS = [
  '¿Que tiempo hace en Alicante?',
  '¿Que tiempo hace en Madrid?',
  '¿Que tiempo hace en Sydney?',
];

/**
 * Helper to check if a message has actual text content.
 */
function hasContent(message: Message): boolean {
  if (typeof message.content === 'string') {
    return message.content.trim().length > 0;
  }
  if (Array.isArray(message.content)) {
    return message.content.some(
      (c) => c.type === 'text' && c.text.trim().length > 0,
    );
  }
  return false;
}

function App() {
  const { scrollRef, contentRef } = useStickToBottom();
  const stream = useStream<typeof weatherAgent>({
    assistantId: 'weatherAgent',
    apiUrl: 'http://localhost:2024',
  });

  const hasMessages = stream.messages.length > 0;

  const handleSubmit = (content: string) => {
    stream.submit({ messages: [{ content, type: 'human' }] });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 w-[42rem] rounded-full bg-orange-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <main ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        <div
          ref={contentRef}
          className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10"
        >
          <header className="mb-5 animate-rise-in px-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Pildora Weather Agent
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Tu asistente de clima y busqueda
            </h1>
          </header>

          {!hasMessages ? (
            <EmptyState
              icon={Wrench}
              title="Consulta el clima con una experiencia mas clara"
              description="Este agente combina herramientas en tiempo real para responder de forma precisa. Empieza con una sugerencia o escribe tu propia pregunta."
              suggestions={TOOL_AGENT_SUGGESTIONS}
              onSuggestionClick={handleSubmit}
            />
          ) : (
            <div className="animate-rise-in rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.5)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-6">
                {stream.messages.map((message, idx) => {
                  // For AI messages, check if they have tool calls
                  if (message.type === 'ai') {
                    const toolCalls = stream.getToolCalls(message);

                    // Render tool calls if present
                    if (toolCalls.length > 0) {
                      return (
                        <div key={message.id} className="flex flex-col gap-3">
                          {toolCalls.map((toolCall) => (
                            <ToolCallCard
                              key={toolCall.id}
                              toolCall={toolCall}
                            />
                          ))}
                        </div>
                      );
                    }

                    // Skip AI messages without content
                    if (!hasContent(message)) {
                      return null;
                    }
                  }

                  return (
                    <MessageBubble key={message.id ?? idx} message={message} />
                  );
                })}
                {/* Show loading indicator when streaming and no content yet */}
                {stream.isLoading &&
                  !stream.messages.some(
                    (m) => m.type === 'ai' && hasContent(m),
                  ) &&
                  stream.toolCalls.length === 0 && <LoadingIndicator />}
              </div>
            </div>
          )}
        </div>
      </main>

      {stream.error != null && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {stream.error instanceof Error
                  ? stream.error.message
                  : 'An error occurred'}
              </span>
            </div>
          </div>
        </div>
      )}

      <MessageInput
        disabled={stream.isLoading}
        placeholder="Pregúntame lo que quieras..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;
