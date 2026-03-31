import { MessageCircle, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function EmptyState({
  icon: Icon = MessageCircle,
  title = 'How can I help you today?',
  description = 'Send a message to start a conversation with the AI assistant.',
  suggestions = [],
  onSuggestionClick,
}: EmptyStateProps) {
  return (
    <section className="animate-rise-in relative overflow-hidden rounded-3xl border border-orange-100/80 bg-gradient-to-br from-amber-50 via-orange-50 to-sky-50 px-5 py-8 text-center shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-14 top-8 h-28 w-28 rounded-full bg-orange-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -right-16 bottom-4 h-36 w-36 rounded-full bg-sky-200/60 blur-2xl" />

      <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/70 shadow-sm backdrop-blur">
        <Icon className="h-8 w-8 text-orange-500" strokeWidth={1.6} />
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mb-7 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
        {description}
      </p>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="cursor-pointer rounded-full border border-slate-200/90 bg-white/85 px-3 py-1.5 text-xs text-slate-700 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-slate-900"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
