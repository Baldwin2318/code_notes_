import React, { useEffect, useMemo, useState } from 'react';

const kindStyles = {
  dev: {
    border: 'border-amber-300/25',
    badge: 'border-amber-300/40 bg-amber-300/15 text-amber-300',
    dot: 'bg-amber-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  warning: {
    border: 'border-rose-300/30',
    badge: 'border-rose-300/40 bg-rose-300/15 text-rose-300',
    dot: 'bg-rose-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  success: {
    border: 'border-emerald-300/30',
    badge: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-300',
    dot: 'bg-emerald-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  info: {
    border: 'border-sky-300/30',
    badge: 'border-sky-300/40 bg-sky-300/15 text-sky-300',
    dot: 'bg-sky-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  }
};

function DevBanner({ config }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [wipOpen, setWipOpen] = useState(false);

  useEffect(() => {
    setDismissed(false);
    setWipOpen(false);
  }, [config?.message, config?.kind, config?.starts_at, config?.ends_at]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 220);
    return () => clearTimeout(timer);
  }, []);

  const bannerKind = useMemo(() => {
    const key = String(config?.kind || 'dev').toLowerCase();
    return kindStyles[key] ? key : 'dev';
  }, [config?.kind]);

  const style = kindStyles[bannerKind];
  const enabled = Boolean(config?.enabled);
  const hasMessage = Boolean(config?.message);
  const wipItems = Array.isArray(config?.wip_items) ? config.wip_items : [];
  const hasWipItems = wipItems.length > 0;

  if (!enabled || !hasMessage || dismissed) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-[100] transform-gpu transition-transform duration-500 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
        role="banner"
        aria-label="Site announcement"
      >
        <div className={`relative overflow-hidden border-b bg-slate-900/95 backdrop-blur ${style.border}`}>
          <div className="mx-auto flex min-h-10 w-full max-w-6xl items-center justify-center gap-2 px-6 py-2 md:px-10">
            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />

            <span
              className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${style.badge}`}
            >
              {bannerKind}
            </span>

            <span className="text-center font-mono text-xs text-slate-300">{config.message}</span>

            {hasWipItems && (
              <button
                type="button"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[11px] text-amber-200 transition hover:border-amber-300/45 hover:bg-amber-300/15"
                aria-expanded={wipOpen}
                aria-label="Show work in progress list"
                onClick={() => setWipOpen((value) => !value)}
              >
                <span aria-hidden="true">[!]</span>
                <span>WIP</span>
              </button>
            )}

            {config.github_url && (
              <a
                href={config.github_url}
                target="_blank"
                rel="noreferrer"
                className={`whitespace-nowrap border-b font-mono text-[11px] transition ${style.link}`}
              >
                GitHub
              </a>
            )}

            {/* {config.dismissible && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-mono text-xs text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Dismiss banner"
                onClick={() => setDismissed(true)}
              >
                X
              </button>
            )} */}
          </div>

          {hasWipItems && wipOpen && (
            <div className="border-t border-slate-800/80 bg-slate-950/95">
              <div className="mx-auto w-full max-w-6xl px-6 py-4 md:px-10">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300/80">
                      Work In Progress
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded px-2 py-1 font-mono text-[11px] text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                    aria-label="Close work in progress list"
                    onClick={() => setWipOpen(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {wipItems.map((item) => (
                    <article
                      key={item.id ?? item.title}
                      className="rounded-2xl border border-slate-800 bg-slate-900/65 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-sans text-sm font-semibold text-slate-100">
                          {item.title}
                        </h3>
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">
                          {item.status_label || 'In progress'}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {item.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`transition-[height] duration-500 ${visible ? (wipOpen ? 'h-52 md:h-40' : 'h-10') : 'h-0'}`}
        aria-hidden="true"
      />
    </>
  );
}

export default DevBanner;
