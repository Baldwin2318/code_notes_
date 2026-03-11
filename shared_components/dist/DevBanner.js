import React, { useEffect, useMemo, useState } from 'react';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const kindStyles = {
  dev: {
    border: 'border-amber-300/25',
    badge: 'border-amber-300/40 bg-amber-300/15 text-amber-300',
    dot: 'bg-amber-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  warning: {
    border: 'border-rose-300/30',
    badge: 'border-rose-300/40 bg-rose-300/15 text-rose-300',
    dot: 'bg-rose-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  success: {
    border: 'border-emerald-300/30',
    badge: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-300',
    dot: 'bg-emerald-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  },
  info: {
    border: 'border-sky-300/30',
    badge: 'border-sky-300/40 bg-sky-300/15 text-sky-300',
    dot: 'bg-sky-300',
    link: 'text-cyan-300 hover:text-cyan-200 border-cyan-300/30 hover:border-cyan-300/70'
  }
};
function DevBanner({
  config
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(false);
  }, [config?.message, config?.kind, config?.starts_at, config?.ends_at]);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 220);
    return () => clearTimeout(timer);
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
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("div", {
      className: `fixed inset-x-0 top-0 z-[100] transform-gpu transition-transform duration-500 ${visible ? 'translate-y-0' : '-translate-y-full'}`,
      role: "banner",
      "aria-label": "Site announcement",
      children: /*#__PURE__*/_jsx("div", {
        className: `relative overflow-hidden border-b bg-slate-900/95 backdrop-blur ${style.border}`,
        children: /*#__PURE__*/_jsxs("div", {
          className: "mx-auto flex min-h-10 w-full max-w-6xl items-center justify-center gap-2 px-6 py-2 md:px-10",
          children: [/*#__PURE__*/_jsx("span", {
            className: `h-2 w-2 shrink-0 rounded-full ${style.dot}`,
            "aria-hidden": "true"
          }), /*#__PURE__*/_jsx("span", {
            className: `rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${style.badge}`,
            children: bannerKind
          }), /*#__PURE__*/_jsx("span", {
            className: "text-center font-mono text-xs text-slate-300",
            children: config.message
          }), config.github_url && /*#__PURE__*/_jsx("a", {
            href: config.github_url,
            target: "_blank",
            rel: "noreferrer",
            className: `whitespace-nowrap border-b font-mono text-[11px] transition ${style.link}`,
            children: "GitHub"
          }), config.dismissible && /*#__PURE__*/_jsx("button", {
            className: "absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-mono text-xs text-slate-500 transition hover:bg-slate-800 hover:text-slate-200",
            "aria-label": "Dismiss banner",
            onClick: () => setDismissed(true),
            children: "X"
          })]
        })
      })
    }), /*#__PURE__*/_jsx("div", {
      className: `transition-[height] duration-500 ${visible ? 'h-10' : 'h-0'}`,
      "aria-hidden": "true"
    })]
  });
}
export default DevBanner;