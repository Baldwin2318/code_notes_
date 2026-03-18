import React from 'react';

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export default Skeleton;
