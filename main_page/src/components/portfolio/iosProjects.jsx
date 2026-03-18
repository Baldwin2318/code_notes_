import React from 'react';
import Skeleton from './Skeleton';

function IOSAppLogo() {
  return (
    <span className="inline-flex h-14 w-14 items-center justify-center text-slate-700">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-12 w-12"
      >
        {/* Source reference for this path: https://github.com/simple-icons/simple-icons */}
        <path d="M16.37 12.61c.02 2.18 1.91 2.91 1.93 2.92-.02.05-.3 1.03-.98 2.03-.59.86-1.2 1.71-2.17 1.73-.95.02-1.26-.56-2.36-.56-1.1 0-1.45.54-2.34.58-.93.04-1.64-.93-2.24-1.79-1.22-1.77-2.15-5-.9-7.17.62-1.08 1.74-1.76 2.95-1.78.92-.02 1.79.62 2.36.62.57 0 1.65-.77 2.78-.66.47.02 1.79.19 2.64 1.44-.07.04-1.58.92-1.57 2.64Zm-1.72-6.84c.49-.6.82-1.43.73-2.26-.71.03-1.56.47-2.07 1.07-.45.52-.84 1.36-.74 2.16.79.06 1.6-.4 2.08-.97Z" />
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
    .join('') || 'iOS';
}

function IOSProjects({ projects = [], loading = false }) {
  return (
    <section id="ios-app-projects" data-reveal className="py-20 md:py-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mt-3 flex items-center gap-3">
            <IOSAppLogo />
            <h2 className="text-2xl font-bold text-slate-700 md:text-3xl">IOS APP Projects</h2>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={`ios-skeleton-${index}`}>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No iOS app repositories found.</p>
      )}

      {!loading && projects.length > 0 && (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-5">
            {projects.map((project) => (
              <article
                key={project.id} >
                <div className="flex items-center gap-4">
                  <a href={`/ios_app_${encodeURIComponent(project.title)}`} className="shrink-0">
                    {project.app_icon_url ? (
                      <img
                        src={project.app_icon_url}
                        alt={`${project.title} app icon`}
                        className="h-16 w-16 rounded-2xl border border-slate-700/70 bg-slate-950 object-cover transition hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800 font-mono text-sm text-cyan-200 transition hover:scale-[1.03]">
                        {getProjectInitials(project.title)}
                      </div>
                    )}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default IOSProjects;
