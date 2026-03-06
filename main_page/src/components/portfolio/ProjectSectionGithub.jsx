import React, { useRef, useEffect } from 'react';
import StatusPill from './StatusPill';

function ProjectSectionGithub({ projects = [] }) {
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
