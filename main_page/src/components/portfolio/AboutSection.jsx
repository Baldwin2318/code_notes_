import React from 'react';
import Skeleton from './Skeleton';

function AboutSection({ bio, loading = false }) {
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
        <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">{bio}</p>
      ) : (
        <p className="mt-6 text-sm text-slate-400">No about information yet.</p>
      )}
    </section>
  );
}

export default AboutSection;
