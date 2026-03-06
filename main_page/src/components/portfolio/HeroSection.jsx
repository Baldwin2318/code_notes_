import React from 'react';

function HeroSection({ profile, typedRole }) {
  return (
    <section id="hero" data-reveal className="border-b border-cyan-300/20 pb-20 pt-14 md:pb-28 md:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300">personal_me</p>
      <h1 className="mt-5 max-w-5xl text-5xl font-extrabold leading-[0.92] text-slate-100 md:text-[5rem]">
        {profile.full_name || 'Portfolio'}
      </h1>

      <p className="mt-5 font-mono text-sm text-cyan-300 md:text-base">
        {typedRole || profile.role_title || ''}
        {(typedRole || profile.role_title) && <span className="typing-cursor" />}
      </p>

      {profile.location && (
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Based in {profile.location}</p>
      )}

      <div className="mt-9 flex flex-wrap gap-3">
        <a
          href="#projects"
          className="rounded-md border border-cyan-300 bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-200"
        >
          View Work
        </a>
        <a
          href="#contact"
          className="rounded-md border border-cyan-300 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
        >
          Contact
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
