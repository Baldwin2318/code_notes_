import React from 'react';

function getProjectInitials(title = '') {
  return title
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'iOS';
}

function IOSProjects({ projects = [] }) {
  return (
    <section id="ios-app-projects" data-reveal className="py-20 md:py-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-3 text-2xl font-bold text-slate-100 md:text-3xl">IOS APP PROJECT</h2>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No iOS app repositories found.</p>
      )}

      {projects.length > 0 && (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-5">
            {projects.map((project) => (
              <article
                key={project.id} >
                <div className="flex items-center gap-4">
                  {project.app_icon_url ? (
                    <img
                      src={project.app_icon_url}
                      alt={`${project.title} app icon`}
                      className="h-16 w-16 rounded-2xl border border-slate-700/70 bg-slate-950 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800 font-mono text-sm text-cyan-200">
                      {getProjectInitials(project.title)}
                    </div>
                  )}
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
