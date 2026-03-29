import React from 'react';
import Skeleton from './Skeleton';

function WebAppLogo() {
  return (
    <span className="inline-flex h-14 w-14 items-center justify-center text-slate-700">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="15" rx="2.5" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
        <path d="M3 8.5h18" />
      </svg>
    </span>
  );
}

function getProjectInitials(title = '') {
  return title
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'WA';
}

function WebAppsSection({ projects = [], loading = false }) {
  return (
    <section id="web-app-projects" data-reveal className="py-20 md:py-28">
      <div className="flex items-end justify-between gap-4">
        <div className="mt-3 flex items-center gap-3">
          <WebAppLogo />
          <h2 className="text-2xl font-bold text-slate-700 md:text-3xl">Web Apps</h2>
        </div>
      </div>

      {loading && (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={`webapp-skeleton-${index}`} className="w-44 shrink-0">
                <Skeleton className="h-44 w-44 rounded-[2rem]" />
                <Skeleton className="mx-auto mt-4 h-4 w-28 rounded-full" />
              </article>
            ))}
          </div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No web app repositories found.</p>
      )}

      {!loading && projects.length > 0 && (
        <div className="mt-8 overflow-x-auto pb-4 slate-scrollbar">
          <div className="flex min-w-max gap-6">
            {projects.map((project) => (
              <article key={project.id} className="w-44 shrink-0">
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  {project.screenshot_url ? (
                    <img
                      src={project.screenshot_url}
                      alt={`${project.title} screenshot`}
                      className="h-44 w-44 rounded-[2rem] border border-slate-700/70 bg-slate-950 object-cover shadow-[0_18px_45px_rgba(8,15,30,0.35)] transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/50 group-hover:shadow-[0_24px_60px_rgba(34,211,238,0.16)]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center rounded-[2rem] border border-slate-700/70 bg-slate-800 font-mono text-4xl text-cyan-200 shadow-[0_18px_45px_rgba(8,15,30,0.35)] transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/50 group-hover:shadow-[0_24px_60px_rgba(34,211,238,0.16)]">
                      {getProjectInitials(project.title)}
                    </div>
                  )}
                  <p className="mt-4 truncate text-center text-sm font-semibold text-slate-200 transition group-hover:text-cyan-200">
                    {project.title}
                  </p>
                </a>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default WebAppsSection;
