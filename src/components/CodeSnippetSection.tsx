interface CodeSnippetItem {
  title: string;
  language: string;
  code: string;
}

export function CodeSnippetSection({
  title,
  items,
}: {
  title: string;
  items: CodeSnippetItem[];
}) {
  return (
    <section className="mb-5 animate-rise-in overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Snippets
        </span>
      </div>

      <div className="grid min-w-0 gap-3">
        {items.map((item) => (
          <details
            key={item.title}
            className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/90 p-3"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-800 marker:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{item.title}</span>
                <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {item.language}
                </span>
              </div>
            </summary>

            <pre className="mt-3 w-full max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
              <code className="block whitespace-pre-wrap break-words">
                {item.code}
              </code>
            </pre>
          </details>
        ))}
      </div>
    </section>
  );
}
