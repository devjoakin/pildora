import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function LandingPage() {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-slate-100 px-6 py-16 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 -top-24 mx-auto h-72 w-[42rem] rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-[0_30px_80px_-55px_rgba(15,23,42,0.5)] backdrop-blur md:p-12">
        <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
          Pildora AI Studio
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Build and test intelligent agents in one place
        </h1>
        <p className="mt-4 text-sm text-slate-600 md:text-base">
          Explore practical examples and start chatting with the simple agent
          immediately.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="border-orange-200 bg-orange-500 px-6 text-white hover:bg-orange-600"
          >
            <Link to="/agents/simple">
              Open agents simple
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
