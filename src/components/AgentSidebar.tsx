import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AGENT_CONFIGS } from '../agents/agentConfig';

export function AgentSidebar() {
  return (
    <aside className="relative border-b border-slate-200/80 bg-white/80 p-3 backdrop-blur md:w-72 md:border-b-0 md:border-r md:p-5">
      <div className="pointer-events-none absolute inset-x-6 -top-10 h-24 rounded-full bg-orange-100/70 blur-2xl md:inset-x-4" />
      <div className="relative">
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-1">
          <NavLink
            to="/agents/introduction"
            className={({ isActive }) =>
              `rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? 'border-orange-300 bg-orange-50 shadow-[0_12px_28px_-20px_rgba(234,88,12,0.75)]'
                  : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <Sparkles
                  className={`h-4 w-4 ${
                    isActive ? 'text-orange-600' : 'text-slate-500'
                  }`}
                />
                <span className="text-sm font-medium text-slate-900">
                  Introduction
                </span>
              </div>
            )}
          </NavLink>

          <p className="px-1 pt-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            Panel de agentes
          </p>

          {AGENT_CONFIGS.map((agent) => {
            const Icon = agent.icon;

            return (
              <NavLink
                key={agent.id}
                to={`/${agent.route}`}
                className={({ isActive }) =>
                  `rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? 'border-orange-300 bg-orange-50 shadow-[0_12px_28px_-20px_rgba(234,88,12,0.75)]'
                      : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? 'text-orange-600' : 'text-slate-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {agent.title}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
