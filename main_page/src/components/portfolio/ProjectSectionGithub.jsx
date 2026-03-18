import React, { useRef, useEffect } from 'react';
import StatusPill from './StatusPill';
import Skeleton from './Skeleton';

function ProjectSectionGithub({ projects = [], loading = false }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 0.5;

  const items = [...projects, ...projects];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || projects.length === 0) return;

    function step() {
      if (!pausedRef.current) {
        offsetRef.current += SPEED;

        const halfWidth = track.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) {
          offsetRef.current = 0;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [projects]);

  if (loading) {
    return (
      <section id="github-projects" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">GitHub Projects</h2>
        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={`github-skeleton-${index}`}
              className="w-72 shrink-0 rounded-xl border border-slate-700/80 bg-slate-900/60 p-5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-7 w-2/3 rounded-xl" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <Skeleton className="mt-5 h-4 w-10 rounded-full" />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="github-projects" data-reveal className="py-20 md:py-28">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">GitHub Projects</h2>
        <p className="mt-6 text-sm text-slate-400">No GitHub projects yet.</p>
      </section>
    );
  }

  return (
    <section id="github-projects" data-reveal className="py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">GitHub Projects</h2>

      <div
        className="relative mt-8 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)'
        }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {items.map((project, index) => (
            <article
              key={`${project.id}-${index}`}
              className="group w-72 shrink-0 rounded-xl border border-slate-700/80 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-cyan-300/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
                  {project.year || 'Now'}
                </span>
                <StatusPill status={project.status || 'active'} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-100 truncate">{project.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300 line-clamp-3">{project.description}</p>

              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Stack</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(project.stack || []).length > 0 ? (
                    project.stack.map((item) => (
                      <span
                        key={`${project.id}-stack-${item}-${index}`}
                        className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-[11px] text-cyan-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No stack detected</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Frameworks</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(project.frameworks || []).length > 0 ? (
                    project.frameworks.slice(0, 8).map((framework) => (
                      <span
                        key={`${project.id}-framework-${framework}-${index}`}
                        className="rounded-md border border-slate-600/70 bg-slate-800/70 px-2 py-1 font-mono text-[11px] text-slate-200"
                      >
                        {framework}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No frameworks detected</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex gap-4 text-sm">
                {(project.html_url || project.repo_url) && (
                  <a
                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                    href={project.html_url || project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Repo
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectSectionGithub;
