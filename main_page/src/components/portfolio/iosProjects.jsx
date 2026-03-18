import React from 'react';
import Skeleton from './Skeleton';

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
          <h2 className="mt-3 text-2xl font-bold text-slate-100 md:text-3xl">IOS APP PROJECT</h2>
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
