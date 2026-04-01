import { ArrowUp } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSubmit,
  disabled = false,
  placeholder = 'Send a message...',
}: MessageInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const content = formData.get('content') as string;

    if (!content.trim()) return;

    form.reset();
    onSubmit(content);
  };

  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <form className="relative" onSubmit={handleSubmit}>
          <div className="relative rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-orange-300 focus-within:shadow-[0_0_0_3px_rgba(251,146,60,0.15)]">
            <textarea
              name="content"
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              className="max-h-[200px] w-full resize-none bg-transparent px-4 py-3 pr-12 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 field-sizing-content"
              onKeyDown={(e) => {
                const target = e.target as HTMLTextAreaElement;

                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  target.form?.requestSubmit();
                }
              }}
            />

            <button
              type="submit"
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-orange-500 p-2 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </footer>
  );
}
