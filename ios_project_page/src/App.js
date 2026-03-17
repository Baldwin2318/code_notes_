import React, { useEffect, useMemo, useState } from 'react';
import { DevBanner, DevRibbon, Footer } from 'shared_components';
import SERVER_URL from 'shared_data/react_critical_data.jsx';

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
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (/^---+$/.test(block)) {
          return <hr key={`hr-${index}`} className="my-8 border-slate-800" />;
        }

        if (block.startsWith('### ')) {
          return (
            <h3 key={`h3-${index}`} className="mt-8 font-sans text-xl font-semibold text-slate-100">
              {renderInlineMarkdown(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith('## ')) {
          return (
            <h2 key={`h2-${index}`} className="mt-10 border-b border-slate-800 pb-3 font-sans text-2xl font-bold text-white">
              {renderInlineMarkdown(block.slice(3))}
            </h2>
          );
        }

        if (block.startsWith('# ')) {
          return (
            <h1 key={`h1-${index}`} className="mt-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl">
              {renderInlineMarkdown(block.slice(2))}
            </h1>
          );
        }

        if (/^[-*] /m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={`ul-${listKey++}`} className="list-disc space-y-3 pl-6 text-sm leading-8 text-slate-300 md:text-base">
              {items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\. /m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          return (
            <ol key={`ol-${listKey++}`} className="list-decimal space-y-3 pl-6 text-sm leading-8 text-slate-300 md:text-base">
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
              <code className="block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm text-slate-200">
                {code}
              </code>
            </pre>
          );
        }

        return (
          <p key={`p-${index}`} className="text-sm leading-8 text-slate-300 md:text-base">
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
        <div className="whitespace-pre-wrap text-sm leading-8 text-slate-300 md:text-base">
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
  const [loading, setLoading] = useState(true);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [ribbonConfig, setRibbonConfig] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProject() {
      if (!repoName) {
        setError('No iOS repository was selected.');
        setLoading(false);
        return;
      }

      try {
        const [projectResponse, bannerResponse, ribbonResponse, profileResponse] = await Promise.all([
          fetch(`${SERVER_URL}/api/ios_app/${encodeURIComponent(repoName)}`),
          fetch(`${SERVER_URL}/api/config/announcement?component=banner`),
          fetch(`${SERVER_URL}/api/config/announcement?component=ribbon`),
          fetch(`${SERVER_URL}/api/personal_me/profile`)
        ]);

        const data = await projectResponse.json();

        if (!projectResponse.ok) {
          throw new Error(data?.error || 'Unable to load the selected iOS project.');
        }

        setProject(data);

        if (bannerResponse.ok) {
          setBannerConfig(await bannerResponse.json());
        }

        if (ribbonResponse.ok) {
          setRibbonConfig(await ribbonResponse.json());
        }

        if (profileResponse.ok) {
          setProfile(await profileResponse.json());
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [repoName]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DevBanner config={bannerConfig} />
      <DevRibbon config={ribbonConfig} />

      <div className="grid-overlay pointer-events-none fixed inset-0" />

      <main className="relative mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
        <a href="/" className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
          Back to portfolio
        </a>

        {loading && (
          <section className="mt-10 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-8">
            <p className="text-sm text-slate-400">Loading selected iOS app...</p>
          </section>
        )}

        {!loading && error && (
          <section className="mt-10 rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-8">
            <h1 className="font-sans text-3xl font-bold text-white">iOS app unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
          </section>
        )}

        {!loading && !error && project && (
          <>
            <section className="mt-10 overflow-hidden rounded-[2rem] border border-transparent bg-transparent">
              <div className="grid gap-8 px-6 py-8 md:grid-cols-[160px_1fr] md:px-10 md:py-10">
                <div className="flex items-start justify-center md:justify-start">
                  {project.app_icon_url ? (
                    <img
                      src={project.app_icon_url}
                      alt={`${project.title} icon`}
                      className="h-36 w-36 rounded-[2rem] border border-slate-700/70 bg-slate-900 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] border border-slate-700/70 bg-slate-900 font-sans text-4xl font-bold text-cyan-200">
                      {project.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">IOS App Projects</p>
                    <h1 className="mt-3 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl">
                      {project.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <span className="rounded-full border border-slate-700 px-3 py-2">{project.year}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-2">{project.repo_name}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sans text-2xl font-bold text-white">Screenshots</h2>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">From repo root /SCREENSHOTS</p>
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
                <p>{project.description}</p>
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
    </div>
  );
}

export default App;
