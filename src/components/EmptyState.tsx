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

      {/* <div className="mb-7 grid gap-3 text-left sm:grid-cols-3">
        <article className="rounded-2xl border border-orange-100 bg-white/80 p-3 shadow-sm backdrop-blur">
          <Sparkles className="mb-2 h-4 w-4 text-orange-500" />
          <p className="text-xs font-medium text-slate-800">
            Respuestas claras
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Obtén clima y contexto en segundos.
          </p>
        </article>
        <article className="rounded-2xl border border-sky-100 bg-white/80 p-3 shadow-sm backdrop-blur">
          <Compass className="mb-2 h-4 w-4 text-sky-500" />
          <p className="text-xs font-medium text-slate-800">Cualquier ciudad</p>
          <p className="mt-1 text-xs text-slate-500">
            Consulta ubicaciones locales o globales.
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-sm backdrop-blur">
          <Timer className="mb-2 h-4 w-4 text-emerald-500" />
          <p className="text-xs font-medium text-slate-800">Flujo continuo</p>
          <p className="mt-1 text-xs text-slate-500">
            Resultados y tool-calls en tiempo real.
          </p>
        </article>
      </div> */}

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
