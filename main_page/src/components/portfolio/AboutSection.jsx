import React, { useEffect, useRef, useState } from 'react';
import Skeleton from './Skeleton';

function AboutSection({ bio, loading = false }) {
  const [typedBio, setTypedBio] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (loading || !bio) {
      setTypedBio('');
      setIsTypingDone(false);
      return undefined;
    }

    setTypedBio('');
    setIsTypingDone(false);

    let currentIndex = 0;

    const typeNextCharacter = () => {
      currentIndex += 1;
      setTypedBio(bio.slice(0, currentIndex));

      if (currentIndex >= bio.length) {
        setTypedBio(bio);
        setIsTypingDone(true);
        typingTimeoutRef.current = null;
        return;
      }

      const currentCharacter = bio[currentIndex - 1];
      const delay = /[.!?]/.test(currentCharacter) ? 1000 : 72;

      typingTimeoutRef.current = setTimeout(typeNextCharacter, delay);
    };

    typingTimeoutRef.current = setTimeout(typeNextCharacter, 500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [bio, loading]);

  return (
    <section id="about" data-reveal>
      {/* <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">About Me</h2> */}
      {loading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full max-w-4xl rounded-full" />
          <Skeleton className="h-4 w-full max-w-3xl rounded-full" />
          <Skeleton className="h-4 w-11/12 max-w-4xl rounded-full" />
          <Skeleton className="h-4 w-2/3 max-w-2xl rounded-full" />
        </div>
      ) : bio ? (
        <p className="mt-6 min-h-[8rem] max-w-4xl whitespace-pre-wrap break-words font-mono text-sm leading-7 text-slate-400 md:text-base">
          {typedBio}
          <span
            aria-hidden="true"
            className={`ml-1 inline-block h-[1.1em] w-2 align-middle ${
              isTypingDone ? 'animate-pulse opacity-60' : 'animate-pulse opacity-100'
            } bg-slate-300`}
          />
        </p>
      ) : (
        <p className="mt-6 text-sm text-slate-400">No about information yet.</p>
      )}
    </section>
  );
}

export default AboutSection;
