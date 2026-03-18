import React, { useEffect, useMemo, useState } from 'react';
import { DevBanner, DevRibbon, Footer, PortfolioChatWidget } from 'shared_components';
import SERVER_URL from 'shared_data/react_critical_data.jsx';

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

function ProjectSkeleton() {
  return (
    <>
      <section className="mt-10 overflow-hidden rounded-[2rem] border border-transparent bg-transparent">
        <div className="grid grid-cols-[96px_1fr] items-start gap-5 px-5 py-8 md:grid-cols-[160px_1fr] md:gap-8 md:px-10 md:py-10">
          <div className="flex items-start justify-start">
            <Skeleton className="h-24 w-24 rounded-[1.5rem] md:h-36 md:w-36 md:rounded-[2rem]" />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="mt-3 h-12 w-full max-w-2xl rounded-[1.25rem] md:h-16" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full max-w-3xl rounded-full" />
                <Skeleton className="h-4 w-11/12 max-w-2xl rounded-full" />
                <Skeleton className="h-4 w-3/4 max-w-xl rounded-full" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-3 w-44 rounded-full" />
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`screenshot-skeleton-${index}`}
              className="h-[420px] w-[210px] shrink-0 rounded-[2rem]"
            />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-transparent bg-transparent p-6 md:p-8">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <div className="mt-5 space-y-4">
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-11/12 rounded-full" />
          <Skeleton className="h-4 w-10/12 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-24 w-full rounded-[1.5rem]" />
        </div>
      </section>
    </>
  );
}

function renderInlineMarkdown(text) {
  const nodes = [];
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(
        <img
          key={`img-${key++}`}
          src={match[2]}
          alt={match[1]}
          className="my-6 rounded-[1.5rem] border border-slate-800 bg-slate-950 shadow-2xl"
        />
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={match[4]}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4"
        >
          {match[3]}
        </a>
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <code key={`code-${key++}`} className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[0.95em] text-cyan-200">
          {match[5]}
        </code>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function SimpleMarkdown({ markdown }) {
  if (!markdown) {
    return null;
  }

  const blocks = markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let listKey = 0;

  return (
    <div className="space-y-5 break-words [overflow-wrap:anywhere]">
      {blocks.map((block, index) => {
        if (/^---+$/.test(block)) {
          return <hr key={`hr-${index}`} className="my-8 border-slate-800" />;
        }

        if (block.startsWith('### ')) {
          return (
            <h3 key={`h3-${index}`} className="mt-8 font-sans text-xl font-semibold text-slate-100 break-words [overflow-wrap:anywhere]">
              {renderInlineMarkdown(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith('## ')) {
          return (
            <h2 key={`h2-${index}`} className="mt-10 border-b border-slate-800 pb-3 font-sans text-2xl font-bold text-white break-words [overflow-wrap:anywhere]">
              {renderInlineMarkdown(block.slice(3))}
            </h2>
          );
        }

        if (block.startsWith('# ')) {
          return (
            <h1 key={`h1-${index}`} className="mt-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl break-words [overflow-wrap:anywhere]">
              {renderInlineMarkdown(block.slice(2))}
            </h1>
          );
        }

        if (/^[-*] /m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={`ul-${listKey++}`} className="list-disc space-y-3 pl-6 text-sm leading-8 text-slate-300 md:text-base break-words [overflow-wrap:anywhere]">
              {items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\. /m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          return (
            <ol key={`ol-${listKey++}`} className="list-decimal space-y-3 pl-6 text-sm leading-8 text-slate-300 md:text-base break-words [overflow-wrap:anywhere]">
              {items.map((item, itemIndex) => (
                <li key={`oli-${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre key={`pre-${index}`} className="my-5 overflow-x-auto">
              <code className="block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 break-words [overflow-wrap:anywhere]">
                {code}
              </code>
            </pre>
          );
        }

        return (
          <p key={`p-${index}`} className="text-sm leading-8 text-slate-300 md:text-base break-words [overflow-wrap:anywhere]">
            {renderInlineMarkdown(block)}
          </p>
        );
      })}
    </div>
  );
}

class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markdown !== this.props.markdown && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    const { hasError } = this.state;
    const { markdown } = this.props;

    if (!markdown) {
      return null;
    }

    if (hasError) {
      return (
        <div className="whitespace-pre-wrap text-sm leading-8 text-slate-300 md:text-base break-words [overflow-wrap:anywhere]">
          {markdown}
        </div>
      );
    }

    return <SimpleMarkdown markdown={markdown} />;
  }
}

function getRepoNameFromPath() {
  const match = window.location.pathname.match(/^\/ios_app_(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

function App() {
  const repoName = useMemo(() => getRepoNameFromPath(), []);
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [projectLoading, setProjectLoading] = useState(true);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [ribbonConfig, setRibbonConfig] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchResource(url, onSuccess, onComplete, onError) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          if (onError) onError(data);
          return;
        }

        onSuccess(data);
      } catch (fetchError) {
        if (!cancelled && onError) {
          onError(fetchError);
        }
      } finally {
        if (!cancelled && onComplete) {
          onComplete();
        }
      }
    }

    function loadProject() {
      if (!repoName) {
        setError('No iOS repository was selected.');
        setProjectLoading(false);
        return;
      }

      fetchResource(
        `${SERVER_URL}/api/ios_app/${encodeURIComponent(repoName)}`,
        (data) => {
          setProject(data);
        },
        () => setProjectLoading(false),
        (fetchError) => {
          const message = fetchError?.error || fetchError?.message || 'Unable to load the selected iOS project.';
          setError(message);
        }
      );

      fetchResource(`${SERVER_URL}/api/config/announcement?component=banner`, (data) => {
        setBannerConfig(data);
      });

      fetchResource(`${SERVER_URL}/api/config/announcement?component=ribbon`, (data) => {
        setRibbonConfig(data);
      });

      fetchResource(`${SERVER_URL}/api/personal_me/profile`, (data) => {
        setProfile(data);
      });
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [repoName]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DevBanner config={bannerConfig} />
      <DevRibbon config={ribbonConfig} />

      <div className="grid-overlay pointer-events-none fixed inset-0" />

      <main className="relative mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
        <a href="/" className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
          &lt; Back to portfolio
        </a>

        {projectLoading && <ProjectSkeleton />}

        {!projectLoading && error && (
          <section className="mt-10 rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-8">
            <h1 className="font-sans text-3xl font-bold text-white">iOS app unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
          </section>
        )}

        {!projectLoading && !error && project && (
          <>
            <section className="mt-10 overflow-hidden rounded-[2rem] border border-transparent bg-transparent">
              <div className="grid grid-cols-[96px_1fr] items-start gap-5 px-5 py-8 md:grid-cols-[160px_1fr] md:gap-8 md:px-10 md:py-10">
                <div className="flex items-start justify-start">
                  {project.app_icon_url ? (
                    <img
                      src={project.app_icon_url}
                      alt={`${project.title} icon`}
                      className="h-24 w-24 rounded-[1.5rem] border border-slate-700/70 bg-slate-900 object-cover shadow-2xl md:h-36 md:w-36 md:rounded-[2rem]"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-slate-700/70 bg-slate-900 font-sans text-3xl font-bold text-cyan-200 md:h-36 md:w-36 md:rounded-[2rem] md:text-4xl">
                      {project.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-white leading-none sm:text-[2.6rem] md:mt-3 md:text-5xl">
                      {project.title}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:mt-4 md:text-base">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400 md:mt-6">
                    <span className="rounded-full border border-slate-700 px-3 py-2">{project.year}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-2">{project.repo_name}</span>
                    {project.repo_url ? (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-cyan-300/35 px-3 py-2 text-cyan-300 transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
                      >
                        View Repo
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sans text-2xl font-bold text-white">Screenshots</h2>
              </div>

              {project.screenshots?.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto pb-4">
                  {project.screenshots.map((screenshot, index) => (
                    <img
                      key={screenshot}
                      src={screenshot}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="h-[420px] w-auto shrink-0 rounded-[2rem] border border-slate-800 bg-slate-950 object-cover shadow-[0_30px_80px_rgba(2,6,23,0.5)]"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/60 p-8 text-sm text-slate-400">
                  No screenshots found in the repository `SCREENSHOTS` folder.
                </div>
              )}
            </section>

            <section className="mt-8 rounded-[2rem] border border-slate-800 p-6 md:p-8 border-transparent bg-transparent">
              <h2 className="font-sans text-2xl font-bold text-white">Description</h2>
              <div className="mt-5 space-y-4">
                {/* <p>{project.description}</p> */}
                <MarkdownErrorBoundary markdown={project.readme_markdown} />
              </div>
            </section>

            <Footer
              fullName={profile?.full_name || 'Baldwin'}
              email={profile?.email || ''}
              github={profile?.github || profile?.github_url || ''}
              linkedin={profile?.linkedin || profile?.linkedin_url || ''}
            />
          </>
        )}
      </main>
      <PortfolioChatWidget
        apiUrl={`${SERVER_URL}/api/chat/portfolio`}
        suggestedPrompts={[
          'What iOS apps has he built?',
          'Tell me about the stack used in this portfolio.',
          'Which GitHub projects are featured here?',
          'How can I contact him?'
        ]}
      />
    </div>
  );
}

export default App;
