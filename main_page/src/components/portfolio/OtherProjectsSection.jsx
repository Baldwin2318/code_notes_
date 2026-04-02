import React, { useMemo, useState } from 'react';
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
  const [selectedId, setSelectedId] = useState(null);

  const selectedProject = useMemo(() => {
    if (projects.length === 0) return null;
    return projects.find((project) => project.id === selectedId) || projects[0];
  }, [projects, selectedId]);

  return (
    <section id="other-projects" data-reveal className="py-20 md:py-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mt-3 flex items-center gap-3">
            <HardwareLogo />
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Other Projects</h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Hardware-software builds, robot experiments, Arduino work, chip projects, and LLM-connected prototypes.
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`other-list-${index}`} className="h-24 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="min-h-[420px] rounded-[2rem]" />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No hardware/software repositories tagged as other were found.</p>
      )}

      {!loading && projects.length > 0 && selectedProject && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            {projects.map((project) => {
              const active = selectedProject.id === project.id;

              return (
                <a
                  key={project.id}
                  href={getProjectUrl(project)}
                  onMouseEnter={() => setSelectedId(project.id)}
                  onFocus={() => setSelectedId(project.id)}
                  className={`group w-full rounded-3xl border p-5 text-left transition ${
                    active
                      ? 'border-amber-300/50 bg-amber-300/10 shadow-[0_20px_55px_rgba(251,191,36,0.12)]'
                      : 'border-slate-700/80 bg-slate-900/60 hover:-translate-y-1 hover:border-cyan-300/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-slate-600/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      {getProjectLabel(project)}
                    </span>
                    <span className="text-xs text-slate-500">{project.year || 'Now'}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-100">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                    {project.description || 'Project details live in the repo and public project page.'}
                  </p>
                </a>
              );
            })}
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-slate-700/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.45)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">Featured build</p>
                <h3 className="mt-3 text-3xl font-bold text-white">{selectedProject.title}</h3>
              </div>
              <a
                href={getProjectUrl(selectedProject)}
                className="inline-flex items-center rounded-full border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20"
              >
                Open project page
              </a>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
              {selectedProject.description || 'Open the project page for build details, source code, parts, and setup notes.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[...(selectedProject.stack || []), ...(selectedProject.frameworks || [])].slice(0, 10).map((item) => (
                <span
                  key={`${selectedProject.id}-${item}`}
                  className="rounded-full border border-amber-200/20 bg-white/5 px-3 py-1 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Parts', href: selectedProject.parts_url },
                { label: 'Assembled', href: selectedProject.assembled_url },
                { label: 'Code', href: selectedProject.code_url },
                { label: 'About', href: selectedProject.about_url || selectedProject.config_url || selectedProject.repo_url }
              ]
                .filter((item) => item.href)
                .map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-4 py-4 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-slate-900"
                  >
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-slate-500">Repo</span>
                    <span className="mt-2 block font-semibold">{item.label}</span>
                  </a>
                ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(selectedProject.preview_assets || []).length > 0 ? (
                selectedProject.preview_assets.map((assetUrl, index) => (
                  <a
                    key={`${selectedProject.id}-preview-${index}`}
                    href={getProjectUrl(selectedProject)}
                    className="group block overflow-hidden rounded-[1.5rem] border border-slate-700/80 bg-slate-950/60"
                  >
                    <img
                      src={assetUrl}
                      alt={`${selectedProject.title} preview ${index + 1}`}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </a>
                ))
              ) : (
                <a
                  href={getProjectUrl(selectedProject)}
                  className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-dashed border-amber-200/20 bg-slate-950/40 p-8 text-center text-sm leading-6 text-slate-400 transition hover:border-amber-200/40 hover:text-slate-200 md:col-span-2 xl:col-span-3"
                >
                  Open the live project page for screenshots, build notes, and interaction.
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default OtherProjectsSection;
