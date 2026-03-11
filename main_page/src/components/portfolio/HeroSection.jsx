import React from 'react';

function HeroSection({ profile, typedRole }) {
  const avatarSrc =
    profile.avatar_url || (profile.avatar_base64 ? `data:image/jpeg;base64,${profile.avatar_base64}` : '');

  return (
    <section id="hero" data-reveal className="border-b border-cyan-300/20 pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="min-w-0 text-center md:text-left">
          <h1 className="mt-5 max-w-5xl text-5xl font-extrabold leading-[0.92] text-slate-100 md:text-[5rem]">
            {profile.full_name || 'Portfolio'}
          </h1>
          {profile.location && (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Based in {profile.location} 🇨🇦
            </p>
          )}
          <p className="mt-5 font-mono text-sm text-cyan-300 md:text-base">
            {typedRole || profile.role_title || ''}
            {(typedRole || profile.role_title) && <span className="typing-cursor" />}
          </p>
        </div>

        <div className="relative mx-auto shrink-0 md:mx-0">
          <div className="rounded-full border border-cyan-300/40 bg-gradient-to-b from-cyan-400/20 to-slate-900/20 p-1 shadow-lg shadow-cyan-500/10">
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

          {/* VERIFIED BADGE */}
          <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
            <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-400 shadow-md shadow-cyan-500/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-900"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;