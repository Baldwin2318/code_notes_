import React, { useEffect, useMemo, useState } from 'react';

const kindStyles = {
  dev: { ribbon: '#b45309', text: '#fef3c7', shadow: '#78350f' },
  warning: { ribbon: '#be123c', text: '#fff1f2', shadow: '#881337' },
  success: { ribbon: '#065f46', text: '#d1fae5', shadow: '#022c22' },
  info: { ribbon: '#0c4a6e', text: '#e0f2fe', shadow: '#082f49' }
};

const CORNER_STYLES = {
  'top-left': {
    wrapper: { top: 0, left: 0 },
    ribbon: { top: 18, left: -38, transform: 'rotate(-45deg)' },
    clip: 'polygon(0 0, 100% 0, 100% 100%)',
    triangle: { top: 0, left: 0 }
  },
  'top-right': {
    wrapper: { top: 0, right: 0 },
    ribbon: { top: 18, right: -38, transform: 'rotate(45deg)' },
    clip: 'polygon(0 0, 100% 0, 0 100%)',
    triangle: { top: 0, right: 0 }
  },
  'bottom-left': {
    wrapper: { bottom: 0, left: 0 },
    ribbon: { bottom: 18, left: -38, transform: 'rotate(45deg)' },
    clip: 'polygon(0 0, 100% 100%, 0 100%)',
    triangle: { bottom: 0, left: 0 }
  },
  'bottom-right': {
    wrapper: { bottom: 0, right: 0 },
    ribbon: { bottom: 18, right: -38, transform: 'rotate(-45deg)' },
    clip: 'polygon(100% 0, 100% 100%, 0 100%)',
    triangle: { bottom: 0, right: 0 }
  }
};

function DevRibbon({ config }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [config?.message, config?.kind, config?.ribbon_corner]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const bannerKind = useMemo(() => {
    const key = String(config?.kind || 'dev').toLowerCase();
    return kindStyles[key] ? key : 'dev';
  }, [config?.kind]);

  const corner = useMemo(() => {
    const key = String(config?.ribbon_corner || 'top-right').toLowerCase();
    return CORNER_STYLES[key] ? key : 'top-right';
  }, [config?.ribbon_corner]);

  const style = kindStyles[bannerKind];
  const position = CORNER_STYLES[corner];

  const enabled = Boolean(config?.enabled);
  const hasMessage = Boolean(config?.message);

  if (!enabled || !hasMessage || dismissed) {
    return null;
  }

  const size = 96;

  return (
    <div
      style={{
        position: 'fixed',
        ...position.wrapper,
        width: size,
        height: size,
        zIndex: 9000,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none'
      }}
      aria-label={`${bannerKind} ribbon: ${config.message}`}
      role="note"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: style.shadow,
          clipPath: position.clip
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: 160,
          textAlign: 'center',
          padding: '5px 0',
          background: style.ribbon,
          color: style.text,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          boxShadow: `0 2px 6px ${style.shadow}`,
          ...position.ribbon,
          pointerEvents: 'auto'
        }}
      >
        {config.message}
      </div>

      {config.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ribbon"
          style={{
            position: 'absolute',
            ...position.triangle,
            margin: 4,
            background: 'transparent',
            border: 'none',
            color: style.text,
            fontSize: 9,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 2,
            opacity: 0.7,
            pointerEvents: 'auto',
            fontFamily: 'monospace'
          }}
          title="Dismiss"
        >
          x
        </button>
      )}
    </div>
  );
}

export default DevRibbon;
