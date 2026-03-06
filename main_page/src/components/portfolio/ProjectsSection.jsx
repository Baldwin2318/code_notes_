import React from 'react';
import StatusPill from './StatusPill';

function ProjectsSection({ projects }) {
  return (
    <section id="projects" data-reveal className="py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Projects</h2>

      {projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No featured projects yet.</p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group rounded-xl border border-slate-700/80 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-cyan-300/50"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
                {project.year || 'Now'}
              </span>
              <StatusPill status={project.status || 'active'} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-100">{project.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(project.tags || []).slice(0, 4).map((tag) => (
                <span key={`${project.id}-${tag}`} className="font-mono text-xs text-cyan-300">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex gap-4 text-sm">
              {project.project_url && (
                <a
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live
                </a>
              )}

              {project.repo_url && (
                <a
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
