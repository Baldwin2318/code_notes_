import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import Skeleton from './Skeleton';

function GithubCommitCounter({ apiUrl }) {
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalRepositories, setTotalRepositories] = useState(0);
  const [displayCommits, setDisplayCommits] = useState(0);
  const [displayRepositories, setDisplayRepositories] = useState(0);
  const sectionRef = useRef(null);
  const counterAnimationRef = useRef(null);

  useEffect(() => {
    const sectionNode = sectionRef.current;

    if (!sectionNode || hasEnteredViewport) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredViewport(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionNode);

    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  useEffect(() => {
    let cancelled = false;

    if (!hasEnteredViewport || !apiUrl) {
      return undefined;
    }

    setLoading(true);

    async function fetchCommitTotal() {
      try {
        const response = await fetch(apiUrl);

        if (!response.ok || cancelled) return;

        const data = await response.json();

        if (!cancelled && data && typeof data === 'object') {
          setTotalCommits(data.total_commits || 0);
          setTotalRepositories(data.total_repositories || 0);
        }
      } catch (error) {
        // Keep fallback value if the API is unavailable.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCommitTotal();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, hasEnteredViewport]);

  useEffect(() => {
    counterAnimationRef.current?.pause?.();

    if (loading || !hasEnteredViewport) {
      setDisplayCommits(0);
      setDisplayRepositories(0);
      return undefined;
    }

    const counterState = { commits: 0, repositories: 0 };

    counterAnimationRef.current = animate(counterState, {
      commits: totalCommits,
      repositories: totalRepositories,
      duration: 1600,
      ease: 'outExpo',
      round: 1,
      onUpdate: () => {
        setDisplayCommits(counterState.commits);
        setDisplayRepositories(counterState.repositories);
      },
      onComplete: () => {
        setDisplayCommits(totalCommits);
        setDisplayRepositories(totalRepositories);
      }
    });

    return () => {
      counterAnimationRef.current?.pause?.();
      counterAnimationRef.current = null;
    };
  }, [hasEnteredViewport, loading, totalCommits, totalRepositories]);

  return (
    <section ref={sectionRef} data-reveal className="flex justify-start mt-8 ml-5 mb-5">
      {!hasEnteredViewport || loading ? (
        <Skeleton className="h-6 w-52 rounded-full" />
      ) : (
        <p className="font-mono text-base text-slate-700">
          {Math.round(displayRepositories).toLocaleString()} repo • {Math.round(displayCommits).toLocaleString()} commits 
        </p>
      )}
    </section>
  );
}

export default GithubCommitCounter;
