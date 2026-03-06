import React from 'react';

function Navbar({ scrolled, links, name }) {
  return (
    <header
      className={`sticky top-0 z-50 border-b transition ${
        scrolled
          ? 'border-cyan-300/20 bg-slate-950/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <div className="font-sans text-lg font-extrabold tracking-tight text-slate-100">
          {name}
          <span className="text-cyan-300">.</span>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="font-mono text-xs uppercase tracking-[0.14em] text-slate-400 transition hover:text-cyan-300"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
