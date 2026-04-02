import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { DevBanner, DevRibbon, Footer, PortfolioChatWidget } from 'shared_components';
import SERVER_URL from 'shared_data/react_critical_data.jsx';

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

function ProjectSkeleton() {
  return (
    <>
      <section className="mt-10 rounded-[2rem]">
        <Skeleton className="h-72 rounded-[2rem]" />
      </section>
      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`other-shot-${index}`} className="h-64 rounded-[2rem]" />
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-[2rem]">
        <Skeleton className="h-80 rounded-[2rem]" />
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
          className="text-amber-200 underline decoration-amber-200/40 underline-offset-4"
        >
          {match[3]}
        </a>
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <code key={`code-${key++}`} className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[0.95em] text-amber-100">
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
  if (!markdown) return null;

  const blocks = markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 break-words [overflow-wrap:anywhere]">
      {blocks.map((block, index) => {
        if (block.startsWith('### ')) {
          return <h3 key={index} className="font-sans text-xl font-semibold text-slate-100">{renderInlineMarkdown(block.slice(4))}</h3>;
        }

        if (block.startsWith('## ')) {
          return <h2 key={index} className="font-sans text-2xl font-bold text-white">{renderInlineMarkdown(block.slice(3))}</h2>;
        }

        if (block.startsWith('# ')) {
          return <h1 key={index} className="font-sans text-4xl font-bold text-white">{renderInlineMarkdown(block.slice(2))}</h1>;
        }

        if (/^[-*] /m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={index} className="list-disc space-y-3 pl-6 text-sm leading-8 text-slate-300 md:text-base">
              {items.map((item, itemIndex) => <li key={`${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
            </ul>
          );
        }

        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre key={index} className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <code className="block text-sm text-slate-200">{code}</code>
            </pre>
          );
        }

        return <p key={index} className="text-sm leading-8 text-slate-300 md:text-base">{renderInlineMarkdown(block)}</p>;
      })}
    </div>
  );
}

function getRepoNameFromPath() {
  return decodeURIComponent(window.location.pathname.replace(/^\/+/, '').split('/')[0] || '');
}

function StlModel({ stlUrl }) {
  const loadedGeometry = useLoader(STLLoader, stlUrl);
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const baseRotationX = Math.PI + 2;
  const baseRotationY = Math.PI;
  const baseRotationZ = Math.PI - 2;
  const targetRotation = useRef({ x: baseRotationX, y: baseRotationY, z: baseRotationZ });
  const geometry = useMemo(() => {
    const nextGeometry = loadedGeometry.clone();
    nextGeometry.computeVertexNormals();
    nextGeometry.center();

    nextGeometry.computeBoundingBox();
    const size = nextGeometry.boundingBox?.getSize(new Vector3());
    const maxDimension = Math.max(size?.x || 0, size?.y || 0, size?.z || 0, 1);
    const scale = 85 / maxDimension;
    nextGeometry.scale(scale, scale, scale);
    nextGeometry.computeBoundingSphere();

    return nextGeometry;
  }, [loadedGeometry]);

  useFrame(() => {
    if (!groupRef.current) return;

    targetRotation.current.y += hovered ? 0.001 : 0.0035;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.08;
    groupRef.current.rotation.z += (targetRotation.current.z - groupRef.current.rotation.z) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        targetRotation.current.x = baseRotationX;
        targetRotation.current.z = baseRotationZ;
      }}
      onPointerMove={(event) => {
        if (!hovered) return;
        targetRotation.current = {
          x: baseRotationX + event.pointer.y * 0.18,
          y: targetRotation.current.y + event.pointer.x * 0.015,
          z: baseRotationZ + event.pointer.x * 0.06
        };
      }}
      rotation={[baseRotationX, baseRotationY, baseRotationZ]}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" metalness={0.12} roughness={0.42} />
      </mesh>
    </group>
  );
}

function StlViewer({ stlUrl = '' }) {
  if (!stlUrl) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/60 p-8 text-sm text-slate-400">
        No STL file found in the repository `ASSEMBLY` folder.
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/70">
      <Canvas
        camera={{ position: [0, 35, 135], fov: 32 }}
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 140, 260]} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[90, 100, 70]} intensity={1.1} castShadow />
        <directionalLight position={[-70, 50, -60]} intensity={0.45} color="#fbbf24" />
        <gridHelper args={[220, 12, '#334155', '#1e293b']} position={[0, -44, 0]} />
        <Suspense fallback={null}>
          <StlModel stlUrl={stlUrl} />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.75}
          minDistance={85}
          maxDistance={185}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </div>
  );
}

function App() {
  const repoName = useMemo(() => getRepoNameFromPath(), []);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
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
        if (!cancelled && onError) onError(fetchError);
      } finally {
        if (!cancelled && onComplete) onComplete();
      }
    }

    if (!repoName) {
      setError('No other project was selected.');
      setProjectLoading(false);
      return () => {
        cancelled = true;
      };
    }

    fetchResource(
      `${SERVER_URL}/api/other_project/${encodeURIComponent(repoName)}`,
      (data) => {
        setProject(data);
        setActiveTab(data?.about_markdown ? 'about' : 'readme');
      },
      () => setProjectLoading(false),
      (fetchError) => setError(fetchError?.error || fetchError?.message || 'Unable to load the selected project.')
    );

    fetchResource(`${SERVER_URL}/api/config/announcement?component=banner`, setBannerConfig);
    fetchResource(`${SERVER_URL}/api/config/announcement?component=ribbon`, setRibbonConfig);
    fetchResource(`${SERVER_URL}/api/personal_me/profile`, setProfile);

    return () => {
      cancelled = true;
    };
  }, [repoName]);

  const activeMarkdown = activeTab === 'about'
    ? project?.about_markdown || project?.config_markdown
    : project?.readme_markdown;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DevBanner config={bannerConfig} />
      <DevRibbon config={ribbonConfig} />
      <div className="grid-overlay pointer-events-none fixed inset-0" />

      <main className="relative mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
        <a href="/" className="text-xs uppercase tracking-[0.28em] text-amber-200/80">
          &lt; Back to portfolio
        </a>

        {projectLoading && <ProjectSkeleton />}

        {!projectLoading && error && (
          <section className="mt-10 rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-8">
            <h1 className="font-sans text-3xl font-bold text-white">Project unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
          </section>
        )}

        {!projectLoading && !error && project && (
          <>
            <section className="mt-10 overflow-hidden rounded-[2rem] border border-amber-200/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-6 md:p-10">
              <p className="text-[11px] uppercase tracking-[0.26em] text-amber-200/70">Other Project</p>
              <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-white md:text-6xl">{project.title}</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{project.description}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-300">
                <span className="rounded-full border border-slate-700 px-3 py-2">{project.year}</span>
                <span className="rounded-full border border-slate-700 px-3 py-2">{project.repo_name}</span>
                {project.repo_url ? (
                  <a href={project.repo_url} target="_blank" rel="noreferrer" className="rounded-full border border-amber-300/35 px-3 py-2 text-amber-200 transition hover:border-amber-300/70 hover:bg-amber-300/10">
                    View Repo
                  </a>
                ) : null}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Parts', href: project.folders?.parts_url },
                  { label: 'Assembled', href: project.folders?.assembled_url },
                  { label: 'Code', href: project.folders?.code_url },
                  { label: 'Config', href: project.folders?.config_url || project.folders?.about_url }
                ].filter((item) => item.href).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.5rem] border border-slate-700/80 bg-slate-950/45 px-4 py-5 transition hover:border-amber-300/40 hover:bg-slate-900"
                  >
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-slate-500">Repository</span>
                    <span className="mt-2 block text-sm font-semibold text-slate-100">{item.label}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sans text-2xl font-bold text-white">3D Viewer</h2>
              </div>
              <StlViewer stlUrl={project.stl_url} />
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sans text-2xl font-bold text-white">Screenshots</h2>
              </div>

              {project.screenshots?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {project.screenshots.map((screenshot, index) => (
                    <img
                      key={screenshot}
                      src={screenshot}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="h-64 w-full rounded-[2rem] border border-slate-800 bg-slate-950 object-cover shadow-[0_24px_70px_rgba(2,6,23,0.45)]"
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

            <section className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-950/40 p-6 md:p-8">
              <div className="inline-flex w-fit rounded-full border border-slate-800 bg-slate-950/60 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  disabled={!project.about_markdown && !project.config_markdown}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    activeTab === 'about'
                      ? 'bg-amber-200 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200 disabled:cursor-not-allowed disabled:text-slate-600'
                  }`}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('readme')}
                  disabled={!project.readme_markdown}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    activeTab === 'readme'
                      ? 'bg-amber-200 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200 disabled:cursor-not-allowed disabled:text-slate-600'
                  }`}
                >
                  README
                </button>
              </div>

              <div className="mt-6">
                <SimpleMarkdown markdown={activeMarkdown} />
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
          'What hardware and software projects are featured here?',
          'What technologies does he use most?',
          'Which GitHub projects are featured here?',
          'How can I contact him?'
        ]}
      />
    </div>
  );
}

export default App;
