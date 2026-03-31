import type { Message } from '@langchain/langgraph-sdk';
import { useStream } from '@langchain/langgraph-sdk/react';
import { AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { emailAgent } from '../agents/cvAgent';
import type { AgentId } from '../agents/agentConfig';
import type { infoAgent } from '../agents/weatherAgent';
import type { occupationSlackAgent } from '../agents/occupationSlackAgent';
import type { travelAgent } from '../agents/travelAgent';
import { useStickToBottom } from 'use-stick-to-bottom';
import { EmptyState } from './EmptyState';
import { LoadingIndicator } from './Loading';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ToolCallCard } from './ToolCallCard';

export interface AgentChatUi {
  badge: string;
  heading: string;
  emptyTitle: string;
  emptyDescription: string;
  placeholder: string;
  icon: LucideIcon;
  suggestions: string[];
}

function hasContent(message: Message): boolean {
  if (typeof message.content === 'string') {
    return message.content.trim().length > 0;
  }
  if (Array.isArray(message.content)) {
    return message.content.some(
      (contentPart) =>
        contentPart.type === 'text' && contentPart.text.trim().length > 0,
    );
  }
  return false;
}

export function AgentChat({
  assistantId,
  ui,
  snippetSection,
}: {
  assistantId: AgentId;
  ui: AgentChatUi;
  snippetSection?: ReactNode;
}) {
  const { scrollRef, contentRef } = useStickToBottom({ initial: false });
  const stream = useStream<
    | typeof infoAgent
    | typeof emailAgent
    | typeof travelAgent
    | typeof occupationSlackAgent
  >({
    assistantId,
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
              {ui.badge}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {ui.heading}
            </h1>
          </header>

          <div className="mb-5">
            <EmptyState
              icon={ui.icon}
              title={ui.emptyTitle}
              description={ui.emptyDescription}
              suggestions={ui.suggestions}
              onSuggestionClick={handleSubmit}
            />
          </div>

          {snippetSection}

          {(hasMessages || stream.isLoading) && (
            <div className="animate-rise-in rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.5)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-6">
                {stream.messages.map((message, index) => {
                  if (message.type === 'ai') {
                    const toolCalls = stream.getToolCalls(message);

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

                    if (!hasContent(message)) {
                      return null;
                    }
                  }

                  return (
                    <MessageBubble
                      key={message.id ?? index}
                      message={message}
                    />
                  );
                })}

                {stream.isLoading &&
                  !stream.messages.some((message) =>
                    message.type === 'ai' ? hasContent(message) : false,
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
              <AlertCircle className="h-4 w-4 shrink-0" />
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
        placeholder={ui.placeholder}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
