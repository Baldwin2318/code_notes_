import React from 'react';

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
  const doubled = [...items, ...items];

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
          animation: `marquee ${duration}s linear infinite`,
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
      >
        {doubled.map((item, index) => {
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

function StackSectionV2({ stack, techMeta }) {
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
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <section id="stack" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>

        <div className="mt-8 flex flex-col gap-3">
          <CarouselRow items={row1} techMeta={techMeta} duration={35} />
          <CarouselRow items={row2} techMeta={techMeta} duration={28} />
        </div>
      </section>
    </>
  );
}

export default StackSectionV2;
