import React from 'react';

function StackSection({ stack, techMeta }) {
  return (
    <section id="stack" data-reveal className="py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>

      {stack.length === 0 && <p className="mt-6 text-sm text-slate-400">No tech stack data yet.</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {stack.map((item) => {
          const meta = techMeta[item] || {
            icon: 'DV',
            accent: 'text-slate-200 border-slate-300/40 bg-slate-200/10'
          };

          return (
            <div
              key={item}
              className="group rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50"
            >
              <div className={`mb-3 inline-flex h-9 min-w-9 items-center justify-center rounded border px-2 ${meta.accent}`}>
                {meta.icon?.startsWith('http') 
                  ? <img src={meta.icon} alt={item} className="h-5 w-5 object-contain" />
                  : <span className="font-mono text-xs">{meta.icon}</span>
                }
              </div>
              <p className="text-sm font-semibold text-slate-100">{item}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StackSection;
