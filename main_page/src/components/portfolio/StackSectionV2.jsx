import React from 'react';
import Skeleton from './Skeleton';

function TechCard({ item, meta }) {
  const isUrl = meta.icon?.startsWith('http');

  return (
    <div className="group flex shrink-0 items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-cyan-300/50">
      <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border ${meta.accent}`}>
        {isUrl ? (
          <img src={meta.icon} alt={item} className="h-4 w-4 object-contain" />
        ) : (
          <span className="font-mono text-[10px]">{meta.icon}</span>
        )}
      </div>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-100">{item}</p>
    </div>
  );
}

function CarouselRow({ items, techMeta, duration = 30 }) {
  // Repeat enough copies so the track is always wider than the viewport.
  // With few items, 2x might be too short — 4x guarantees seamless loop.
  const repeated = [...items, ...items, ...items, ...items];
  // We animate -25% (1 out of 4 copies) so the reset is invisible.
  const pct = 25;

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
      }}
    >
      <div
        className="flex gap-3"
        style={{
          width: 'max-content',
          animation: `marquee-${pct} ${duration}s linear infinite`,
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
      >
        {repeated.map((item, index) => {
          const meta = techMeta[item] || {
            icon: item.slice(0, 2).toUpperCase(),
            accent: 'text-slate-200 border-slate-300/40 bg-slate-200/10'
          };
          return <TechCard key={`${item}-${index}`} item={item} meta={meta} />;
        })}
      </div>
    </div>
  );
}

function StackSectionV2({ stack, techMeta, loading = false }) {
  if (loading) {
    return (
      <section id="stack" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={`stack-skeleton-row-1-${index}`} className="h-[56px] w-32 rounded-xl" />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`stack-skeleton-row-2-${index}`} className="h-[56px] w-28 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stack || stack.length === 0) {
    return (
      <section id="stack" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>
        <p className="mt-6 text-sm text-slate-400">No tech stack data yet.</p>
      </section>
    );
  }

  const mid = Math.ceil(stack.length / 2);
  const row1 = stack.slice(0, mid);
  const row2 = stack.slice(mid);

  return (
    <>
      <style>{`
        @keyframes marquee-25 {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>

      <section id="stack" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>

        <div className="mt-8 flex flex-col gap-3">
          <CarouselRow items={row1} techMeta={techMeta} duration={40} />
          <CarouselRow items={row2} techMeta={techMeta} duration={32} />
        </div>
      </section>
    </>
  );
}

export default StackSectionV2;
