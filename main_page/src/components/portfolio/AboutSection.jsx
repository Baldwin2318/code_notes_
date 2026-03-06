import React from 'react';

function AboutSection({ bio }) {
  return (
    <section id="about" data-reveal className="py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">About</h2>
      {bio ? (
        <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">{bio}</p>
      ) : (
        <p className="mt-6 text-sm text-slate-400">No about information yet.</p>
      )}
    </section>
  );
}

export default AboutSection;
