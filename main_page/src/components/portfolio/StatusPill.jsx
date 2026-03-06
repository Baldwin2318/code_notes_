import React from 'react';

const statusClassMap = {
  active: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300',
  shipped: 'border-sky-300/30 bg-sky-300/10 text-sky-300',
  in_dev: 'border-amber-300/30 bg-amber-300/10 text-amber-300'
};

function StatusPill({ status }) {
  const key = String(status || 'active').toLowerCase();
  const label = key.replace('_', ' ');

  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${
        statusClassMap[key] || statusClassMap.active
      }`}
    >
      {label}
    </span>
  );
}

export default StatusPill;
