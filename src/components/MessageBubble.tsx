import { Brain } from 'lucide-react';
import type { ContentBlock } from 'langchain';
import type { Message } from '@langchain/langgraph-sdk';

// Styles for each message type - kept separate for readability
const BUBBLE_STYLES = {
  human:
    'bg-slate-200/85 text-slate-800 border border-slate-300/70 rounded-2xl px-4 py-2.5 ml-auto max-w-[85%] md:max-w-[70%] w-fit',
  system:
    'bg-amber-50/80 border border-amber-200 text-slate-700 rounded-lg px-4 py-3',
  ai: 'bg-orange-50/70 border border-orange-200/80 text-slate-800 rounded-2xl px-4 py-2.5',
} as const;

/**
 * Extract text content from a message
 */
function getTextContent(message: Message): string {
  if (typeof message.content === 'string') {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    return message.content
      .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
      .map((c) => c.text)
      .join('');
  }
  return '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function markdownInlineToHtml(value: string): string {
  return value
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="text-sky-700 underline underline-offset-2 hover:text-sky-800">$1</a>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-slate-900/10 px-1 py-0.5 font-mono text-[0.92em]">$1</code>',
    );
}

function markdownToSafeHtml(markdown: string): string {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, '\n').trim());
  const codeBlocks: string[] = [];

  const withPlaceholders = escaped.replace(
    /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g,
    (_, language, code) => {
      const langLabel =
        typeof language === 'string' && language.trim().length > 0
          ? `<span class="mb-2 inline-block rounded bg-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-200">${language.trim()}</span>`
          : '';

      const block = `<pre class="my-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-slate-100"><code class="font-mono text-[13px] leading-relaxed">${langLabel}${code.trim()}</code></pre>`;
      const index = codeBlocks.push(block) - 1;
      return `@@CODE_BLOCK_${index}@@`;
    },
  );

  const lines = withPlaceholders.split('\n');
  const parts: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const placeholderMatch = line.match(/^@@CODE_BLOCK_(\d+)@@$/);

    if (placeholderMatch) {
      if (inList) {
        parts.push('</ul>');
        inList = false;
      }

      const index = Number(placeholderMatch[1]);
      parts.push(codeBlocks[index]);
      continue;
    }

    if (line.length === 0) {
      if (inList) {
        parts.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        parts.push('<ul class="my-2 list-disc space-y-1 pl-5">');
        inList = true;
      }

      parts.push(
        `<li>${markdownInlineToHtml(line.replace(/^[-*]\s+/, ''))}</li>`,
      );
      continue;
    }

    if (inList) {
      parts.push('</ul>');
      inList = false;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const level = line.match(/^#{1,3}/)?.[0].length ?? 1;
      const text = markdownInlineToHtml(line.replace(/^#{1,3}\s+/, ''));
      const tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      const className =
        level === 1
          ? 'mt-3 text-lg font-semibold'
          : level === 2
            ? 'mt-3 text-base font-semibold'
            : 'mt-2 text-sm font-semibold';
      parts.push(`<${tag} class="${className}">${text}</${tag}>`);
      continue;
    }

    parts.push(`<p class="my-1">${markdownInlineToHtml(line)}</p>`);
  }

  if (inList) {
    parts.push('</ul>');
  }

  return parts.join('');
}

function MarkdownContent({ content }: { content: string }) {
  const html = markdownToSafeHtml(content);

  return (
    <div
      className="leading-relaxed text-[15px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * MessageBubble component that renders human and AI text messages.
 * Tool calls are handled separately by ToolCallCard.
 */
export function MessageBubble({ message }: { message: Message }) {
  const content = getTextContent(message);

  /**
   * Don't render tool messages as render them separately
   */
  if (message.type === 'tool') {
    return null;
  }

  if (message.type === 'system') {
    return <SystemBubble content={content} />;
  }

  if (message.type === 'human') {
    return <HumanBubble content={content} />;
  }

  return <AssistantBubble message={message} />;
}

/**
 * Human message bubble - right-aligned with brand colors
 */
function HumanBubble({ content }: { content: string }) {
  return (
    <div className="animate-fade-in">
      <div className={BUBBLE_STYLES.human}>
        <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
          {content}
        </div>
      </div>
    </div>
  );
}

/**
 * System message bubble - warning-styled with amber colors
 */
function SystemBubble({ content }: { content: string }) {
  return (
    <div className="animate-fade-in">
      <div className="text-xs font-medium text-black-500 mb-2">System</div>
      <div className={BUBBLE_STYLES.system}>
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}

/**
 * Assistant message bubble with reasoning bubble if it exists
 */
function AssistantBubble({ message }: { message: Message }) {
  const content = getTextContent(message);
  const reasoning = getReasoningFromMessage(message);

  return (
    <>
      {/* Render reasoning bubble if it exists */}
      {reasoning && <ReasoningBubble content={reasoning} />}
      {content && (
        <div className="animate-fade-in">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Assistant
          </div>
          <div className={BUBBLE_STYLES.ai}>
            <MarkdownContent content={content} />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Reasoning bubble component - displays thinking tokens in a separate bubble
 */
function ReasoningBubble({ content }: { content: string }) {
  return (
    <div className="animate-fade-in">
      {/* Label */}
      <div className="text-xs font-medium text-amber-400/80 mb-2 flex items-center gap-1.5">
        <Brain className="w-3 h-3" />
        <span>Reasoning</span>
      </div>

      {/* Bubble */}
      <div className="bg-linear-to-br from-amber-950/50 to-orange-950/40 border border-amber-500/20 rounded-2xl px-4 py-3 max-w-[95%]">
        <div className="text-sm text-black-100/90 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

/**
 * Extracts reasoning/thinking content from an AI message.
 *
 * Supports the standardized content block format where both OpenAI reasoning
 * and Anthropic extended thinking are normalized to `type: "reasoning"` blocks
 * with a `reasoning` field in message.content, e.g.
 *
 * ```ts
 * const message: AIMessage = {
 *   type: "ai",
 *   content: [
 *     { type: "reasoning", reasoning: "I am thinking..." },
 *     { type: "text", text: "The answer is 42" },
 *   ],
 * };
 *
 * console.log(message.text); // "The answer is 42"
 * ```
 *
 * @param message - The AI message to extract reasoning from.
 * @returns a string of the reasoning/thinking content if found, undefined otherwise.
 *
 * @example
 * ```ts
 * const reasoning = getReasoningFromMessage(aiMessage);
 * if (reasoning) {
 *   console.log("Model is thinking:", reasoning);
 * }
 * ```
 */
export function getReasoningFromMessage(message: Message): string | undefined {
  if (Array.isArray(message.content)) {
    const reasoningContent = (message.content as ContentBlock[])
      .filter(
        (block): block is ContentBlock.Reasoning =>
          typeof block === 'object' &&
          block !== null &&
          'type' in block &&
          block.type === 'reasoning' &&
          'reasoning' in block &&
          typeof block.reasoning === 'string',
      )
      .map((block) => block.reasoning)
      .join('');

    if (reasoningContent.trim()) {
      return reasoningContent;
    }
  }

  return undefined;
}
