import React from 'react';

function ContactSection({ email, github, linkedin }) {
  const hasAny = Boolean(email || github || linkedin);

  return (
    <section id="contact" data-reveal className="border-t border-cyan-300/20 py-20 md:py-28">
      <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Contact</h2>

      {!hasAny && <p className="mt-6 text-sm text-slate-400">No contact details available yet.</p>}

      <div className="mt-6 flex flex-col gap-2 text-sm md:text-base">
        {email && (
          <a className="text-cyan-300 transition hover:text-cyan-200" href={`mailto:${email}`}>
            {email}
          </a>
        )}
        {github && (
          <a className="text-cyan-300 transition hover:text-cyan-200" href={github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {linkedin && (
          <a className="text-cyan-300 transition hover:text-cyan-200" href={linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
