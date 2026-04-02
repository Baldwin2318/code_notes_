import React, { useMemo } from 'react';
import Skeleton from './Skeleton';

function HardwareLogo() {
  return (
    <span className="inline-flex h-14 w-14 items-center justify-center text-amber-300/80">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M4 10h3" />
        <path d="M4 14h3" />
        <path d="M17 10h3" />
        <path d="M17 14h3" />
        <path d="M10 4v3" />
        <path d="M14 4v3" />
        <path d="M10 17v3" />
        <path d="M14 17v3" />
      </svg>
    </span>
  );
}

function getProjectLabel(project) {
  const combined = [...(project.stack || []), ...(project.frameworks || [])].join(' ').toLowerCase();

  if (combined.includes('arduino')) return 'Arduino';
  if (combined.includes('swift')) return 'Embedded + App';
  if (combined.includes('python')) return 'Python + Hardware';
  if (combined.includes('node')) return 'Node + Device';
  return 'Hardware + Software';
}

function getProjectUrl(project) {
  return `/${encodeURIComponent(project.title)}`;
}

function OtherProjectsSection({ projects = [], loading = false }) {
  const visibleProjects = useMemo(() => projects, [projects]);

  return (
    <section id="other-projects" data-reveal className="py-20 md:py-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mt-3 flex items-center gap-3">
            <HardwareLogo />
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Other Projects</h2>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <article key={`other-list-${index}`} className="overflow-hidden rounded-[2rem]">
              <Skeleton className="h-52 rounded-[2rem]" />
              <Skeleton className="mt-3 h-4 w-32 rounded-full" />
            </article>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No hardware/software repositories tagged as other were found.</p>
      )}

      {!loading && visibleProjects.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <a
              key={project.id}
              href={getProjectUrl(project)}
              className="group block overflow-hidden rounded-[2rem] border border-slate-700/80 bg-slate-900/60 shadow-[0_24px_70px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_28px_80px_rgba(251,191,36,0.12)]"
            >
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt={`${project.title} thumbnail`}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-56 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] text-sm uppercase tracking-[0.18em] text-amber-100/80">
                  {getProjectLabel(project)}
                </div>
              )}
              <div className="px-5 py-4">
                <p className="truncate text-sm font-semibold text-slate-100">{project.title}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export default OtherProjectsSection;
