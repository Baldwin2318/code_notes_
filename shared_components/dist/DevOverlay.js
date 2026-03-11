import React, { useEffect, useMemo, useState } from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const kindStyles = {
  dev: {
    accent: '#f6c90e',
    badge: {
      border: '1px solid rgba(246,201,14,0.45)',
      background: 'rgba(246,201,14,0.1)',
      color: '#f6c90e'
    },
    glow: 'rgba(246,201,14,0.12)'
  },
  warning: {
    accent: '#fb7185',
    badge: {
      border: '1px solid rgba(251,113,133,0.45)',
      background: 'rgba(251,113,133,0.1)',
      color: '#fb7185'
    },
    glow: 'rgba(251,113,133,0.12)'
  },
  success: {
    accent: '#34d399',
    badge: {
      border: '1px solid rgba(52,211,153,0.45)',
      background: 'rgba(52,211,153,0.1)',
      color: '#34d399'
    },
    glow: 'rgba(52,211,153,0.12)'
  },
  info: {
    accent: '#38bdf8',
    badge: {
      border: '1px solid rgba(56,189,248,0.45)',
      background: 'rgba(56,189,248,0.1)',
      color: '#38bdf8'
    },
    glow: 'rgba(56,189,248,0.12)'
  }
};
const ICONS = {
  dev: color => /*#__PURE__*/_jsxs("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "24",
      cy: "24",
      r: "22",
      stroke: color,
      strokeWidth: "1.5",
      strokeDasharray: "4 3"
    }), /*#__PURE__*/_jsx("path", {
      d: "M16 18l-6 6 6 6M32 18l6 6-6 6M27 14l-6 20",
      stroke: color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })]
  }),
  warning: color => /*#__PURE__*/_jsxs("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none",
    children: [/*#__PURE__*/_jsx("path", {
      d: "M24 6L44 40H4L24 6Z",
      stroke: color,
      strokeWidth: "1.5",
      strokeLinejoin: "round"
    }), /*#__PURE__*/_jsx("path", {
      d: "M24 20v10M24 34v2",
      stroke: color,
      strokeWidth: "2.5",
      strokeLinecap: "round"
    })]
  }),
  success: color => /*#__PURE__*/_jsxs("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "24",
      cy: "24",
      r: "20",
      stroke: color,
      strokeWidth: "1.5"
    }), /*#__PURE__*/_jsx("path", {
      d: "M14 24l7 7 13-14",
      stroke: color,
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })]
  }),
  info: color => /*#__PURE__*/_jsxs("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "24",
      cy: "24",
      r: "20",
      stroke: color,
      strokeWidth: "1.5"
    }), /*#__PURE__*/_jsx("path", {
      d: "M24 22v12M24 16v2",
      stroke: color,
      strokeWidth: "2.5",
      strokeLinecap: "round"
    })]
  })
};
function DevOverlay({
  config
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setDismissed(false);
  }, [config?.message, config?.kind, config?.overlay_title, config?.overlay_cta]);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 530);
    return () => clearInterval(id);
  }, []);
  const bannerKind = useMemo(() => {
    const key = String(config?.kind || 'dev').toLowerCase();
    return kindStyles[key] ? key : 'dev';
  }, [config?.kind]);
  const style = kindStyles[bannerKind];
  const enabled = Boolean(config?.enabled);
  const hasMessage = Boolean(config?.message);
  if (!enabled || !hasMessage || dismissed) {
    return null;
  }
  const title = config.overlay_title || (bannerKind === 'dev' ? 'Under Construction' : bannerKind.toUpperCase());
  const ctaLabel = config.overlay_cta || (config.dismissible ? 'Got it, let me in' : null);
  return /*#__PURE__*/_jsxs("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(6,8,15,0.97)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.45s ease'
    },
    children: [/*#__PURE__*/_jsx("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${style.glow}, transparent 70%)`,
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/_jsx("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(${style.accent}08 1px, transparent 1px), linear-gradient(90deg, ${style.accent}08 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/_jsxs("div", {
      style: {
        position: 'relative',
        maxWidth: 520,
        width: '90%',
        padding: '48px 44px',
        border: `1px solid ${style.accent}30`,
        borderRadius: 4,
        background: 'rgba(10,12,22,0.90)',
        boxShadow: `0 0 60px ${style.glow}, inset 0 1px 0 ${style.accent}15`,
        textAlign: 'center'
      },
      children: [/*#__PURE__*/_jsx("div", {
        style: {
          marginBottom: 20
        },
        children: ICONS[bannerKind](style.accent)
      }), /*#__PURE__*/_jsx("div", {
        style: {
          marginBottom: 18
        },
        children: /*#__PURE__*/_jsx("span", {
          style: {
            ...style.badge,
            borderRadius: 3,
            padding: '3px 10px',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            display: 'inline-block'
          },
          children: bannerKind
        })
      }), /*#__PURE__*/_jsx("h1", {
        style: {
          margin: '0 0 14px',
          fontSize: 22,
          fontWeight: 700,
          color: '#e8eaf0',
          letterSpacing: '0.04em'
        },
        children: title
      }), /*#__PURE__*/_jsxs("p", {
        style: {
          margin: '0 0 28px',
          fontSize: 13,
          color: '#94a3b8',
          lineHeight: 1.65
        },
        children: [config.message, /*#__PURE__*/_jsx("span", {
          style: {
            opacity: tick % 2 === 0 ? 1 : 0,
            color: style.accent
          },
          children: "|"
        })]
      }), config.github_url && /*#__PURE__*/_jsx("a", {
        href: config.github_url,
        target: "_blank",
        rel: "noreferrer",
        style: {
          display: 'inline-block',
          marginBottom: ctaLabel ? 16 : 0,
          fontSize: 11,
          color: '#67e8f9',
          borderBottom: '1px solid rgba(103,232,249,0.3)',
          textDecoration: 'none',
          letterSpacing: '0.06em',
          transition: 'color 0.2s, border-color 0.2s'
        },
        children: "View on GitHub ->"
      }), ctaLabel && /*#__PURE__*/_jsx("div", {
        style: {
          marginTop: config.github_url ? 12 : 0
        },
        children: /*#__PURE__*/_jsx("button", {
          onClick: () => setDismissed(true),
          style: {
            cursor: 'pointer',
            background: 'transparent',
            border: `1px solid ${style.accent}50`,
            borderRadius: 3,
            color: style.accent,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '9px 22px',
            transition: 'background 0.2s, border-color 0.2s',
            fontFamily: 'inherit'
          },
          onMouseEnter: event => {
            event.currentTarget.style.background = `${style.accent}15`;
            event.currentTarget.style.borderColor = style.accent;
          },
          onMouseLeave: event => {
            event.currentTarget.style.background = 'transparent';
            event.currentTarget.style.borderColor = `${style.accent}50`;
          },
          children: ctaLabel
        })
      })]
    })]
  });
}
export default DevOverlay;