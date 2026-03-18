import React, { useEffect, useRef } from 'react';
import StatusPill from './StatusPill';
import Skeleton from './Skeleton';

function GithubLogo() {
  return (
    <span className="inline-flex h-16 w-16 items-center justify-center text-slate-700">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-12 w-12"
      >
        {/* Source reference for this path: https://github.com/simple-icons/simple-icons/blob/develop/_data/simple-icons.json */}
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.58 9.58 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    </span>
  );
}

function ProjectSectionGithub({ projects = [], loading = false }) {
  const scrollRef = useRef(null);
  const [pendingProject, setPendingProject] = React.useState(null);
  const items = [...projects, ...projects, ...projects];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || projects.length === 0) return;

    const sectionWidth = container.scrollWidth / 3;
    container.scrollLeft = sectionWidth;
  }, [projects]);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container || projects.length === 0) return;

    const sectionWidth = container.scrollWidth / 3;
    const current = container.scrollLeft;

    if (current <= 1) {
      container.scrollLeft = current + sectionWidth;
    } else if (current >= sectionWidth * 2 - 1) {
      container.scrollLeft = current - sectionWidth;
    }
  }

  if (loading) {
    return (
      <section id="github-projects" data-reveal className="py-20 md:py-28">
        <div className="flex items-center gap-3">
          <GithubLogo />
          <h2 className="text-2xl font-bold text-slate-700 md:text-3xl">GitHub Projects</h2>
        </div>
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
        <div className="flex items-center gap-3">
          <GithubLogo />
          <h2 className="text-2xl font-bold text-slate-700 md:text-3xl">GitHub Projects</h2>
        </div>
        <p className="mt-6 text-sm text-slate-400">No GitHub projects yet.</p>
      </section>
    );
  }

  return (
    <>
      <section id="github-projects" data-reveal className="py-20 md:py-28">
        <div className="flex items-center gap-3">
          <GithubLogo />
          <h2 className="text-2xl font-bold text-slate-700 md:text-3xl">GitHub Projects</h2>
        </div>

        <div
          ref={scrollRef}
          className="relative mt-8 overflow-x-auto overflow-y-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)'
          }}
          onScroll={handleScroll}
        >
          <div
            className="flex gap-4"
            style={{ width: 'max-content' }}
          >
            {items.map((project, index) => (
              <article
                key={`${project.id}-${index}`}
                className="group w-72 shrink-0 rounded-xl border border-slate-700/80 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-cyan-300/50 cursor-pointer"
                onClick={() => {
                  if (project.html_url || project.repo_url) {
                    setPendingProject(project);
                  }
                }}>
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
                    <div className="flex flex-wrap gap-2">
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {pendingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-6" onClick={() => setPendingProject(null)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/40">
            <h3 className="font-sans text-xl font-bold text-slate-100">Open GitHub repository?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Jump to the GitHub repo for <span className="font-semibold text-slate-100">{pendingProject.title}</span>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-5">
              <button
                type="button"
                className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
                onClick={() => setPendingProject(null)}
              >
                No
              </button>
              <a
                href={pendingProject.html_url || pendingProject.repo_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cyan-300/35 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
                onClick={() => setPendingProject(null)}
              >
                Yes
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectSectionGithub;
