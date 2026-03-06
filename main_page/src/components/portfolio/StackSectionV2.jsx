import React, { useRef, useEffect } from 'react';

const SPEED_ROW1 = 0.4;
const SPEED_ROW2 = 0.3;

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

function CarouselRow({ items, techMeta, speed, reverse = false }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  const doubled = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    // start halfway through for reverse row so they don't sync
    if (reverse) offsetRef.current = 0;

    function step() {
      if (!pausedRef.current) {
        offsetRef.current += speed;
        const halfWidth = track.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) offsetRef.current = 0;
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [items, speed, reverse]);

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)'
      }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div
        ref={trackRef}
        className="flex gap-3 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, index) => {
          const meta = techMeta[item] || {
            icon: item.slice(0, 2).toUpperCase(),
            accent: 'text-slate-200 border-slate-300/40 bg-slate-200/10'
          };
          return (
            <TechCard key={`${item}-${index}`} item={item} meta={meta} />
          );
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

  // split stack into two roughly equal rows
  const mid = Math.ceil(stack.length / 2);
  const row1 = stack.slice(0, mid);
  const row2 = stack.slice(mid);

  return (
    <section id="stack" data-reveal className="py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Tech Stack</h2>

      <div className="mt-8 flex flex-col gap-3">
        <CarouselRow items={row1} techMeta={techMeta} speed={SPEED_ROW1} />
        <CarouselRow items={row2} techMeta={techMeta} speed={SPEED_ROW2} reverse />
      </div>
    </section>
  );
}

export default StackSectionV2;
