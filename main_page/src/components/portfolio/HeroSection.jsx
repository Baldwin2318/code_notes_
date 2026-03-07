import React from 'react';

function HeroSection({ profile, typedRole }) {
  const avatarSrc =
    profile.avatar_url || (profile.avatar_base64 ? `data:image/jpeg;base64,${profile.avatar_base64}` : '');

  return (
    <section id="hero" data-reveal className="border-b border-cyan-300/20 pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="min-w-0 text-center md:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300">personal_me</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-extrabold leading-[0.92] text-slate-100 md:text-[5rem]">
            {profile.full_name || 'Portfolio'}
          </h1>

          <p className="mt-5 font-mono text-sm text-cyan-300 md:text-base">
            {typedRole || profile.role_title || ''}
            {(typedRole || profile.role_title) && <span className="typing-cursor" />}
          </p>

          {profile.location && (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Based in {profile.location}
            </p>
          )}

          <div className="mt-9 flex flex-wrap justify-center gap-3 md:justify-start">
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
        </div>

        <div className="mx-auto shrink-0 rounded-full border border-cyan-300/40 bg-gradient-to-b from-cyan-400/20 to-slate-900/20 p-1 shadow-lg shadow-cyan-500/10 md:mx-0">
          <div className="h-32 w-32 overflow-hidden rounded-full bg-slate-900 md:h-48 md:w-48">
            {avatarSrc ? (
              <img src={avatarSrc} alt={profile.full_name || 'Profile'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-sm text-slate-500">
                No Image
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
