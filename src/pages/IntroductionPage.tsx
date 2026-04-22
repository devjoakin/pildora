import { Bot,  Wrench, BrainCircuit, SearchCode } from 'lucide-react';

const INTRO_TERMS = [
  {
    title: 'Agente',
    description:
      'Es un sistema que puede percibir, decidir y actuar para cumplir con su propósito.',
    icon: Bot,
  },
  {
    title: 'Modelos',
    description:
      'Modelos generales. Fine-tuning o entrenamiento específico.',
    icon: BrainCircuit,
  },
  {
    title: 'Tools',
    description:
      'Ampliación de capacidades del agente.',
    icon: Wrench,
  },
  {
    title: 'Concepto',
    description:
      'Ejemplo de pequeñas aplicaciones.',
    icon: SearchCode,
  },
  
];

export function IntroductionPage() {
  return (
    <main className="relative h-full overflow-y-auto bg-slate-100 px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 w-[42rem] rounded-full bg-orange-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <section className="relative z-10 mx-auto w-full max-w-4xl rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8">
        <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
          Introducción
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Pequeños apuntes antes de empezar
        </h1>
        {/* <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Antes de abrir un agente, revisa estos terminos para entender como
          funciona cada flujo.
        </p> */}

        <ul className="mt-6 space-y-3">
          {INTRO_TERMS.map((term) => {
            const Icon = term.icon;

            return (
              <li
                key={term.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.3)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-xl bg-orange-100 p-2 text-orange-600">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {term.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {term.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
