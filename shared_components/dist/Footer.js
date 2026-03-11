import React from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function IconWrapper({
  children
}) {
  return /*#__PURE__*/_jsx("span", {
    className: "flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 text-cyan-200 transition group-hover:border-cyan-300/60 group-hover:text-cyan-100",
    children: children
  });
}
function GitHubIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    className: "h-4 w-4 fill-current",
    "aria-hidden": "true",
    children: /*#__PURE__*/_jsx("path", {
      d: "M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.6c.58.1.79-.25.79-.56v-2.03c-3.18.7-3.85-1.35-3.85-1.35-.52-1.3-1.26-1.65-1.26-1.65-1.04-.7.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.54-.29-5.22-1.27-5.22-5.65 0-1.25.45-2.26 1.18-3.06-.12-.29-.51-1.48.11-3.08 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.6.23 2.79.11 3.08.74.8 1.18 1.81 1.18 3.06 0 4.39-2.69 5.35-5.25 5.64.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
    })
  });
}
function LinkedInIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    className: "h-4 w-4 fill-current",
    "aria-hidden": "true",
    children: /*#__PURE__*/_jsx("path", {
      d: "M4.98 3.5A2.49 2.49 0 1 0 5 8.48 2.49 2.49 0 0 0 4.98 3.5ZM3 9.75h3.97V21H3V9.75ZM9.47 9.75h3.8v1.54h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H17.9v-5.04c0-1.2-.02-2.74-1.67-2.74-1.68 0-1.94 1.31-1.94 2.66V21H9.47V9.75Z"
    })
  });
}
function MailIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    className: "h-4 w-4 fill-current",
    "aria-hidden": "true",
    children: /*#__PURE__*/_jsx("path", {
      d: "M3 5.25h18A1.75 1.75 0 0 1 22.75 7v10A1.75 1.75 0 0 1 21 18.75H3A1.75 1.75 0 0 1 1.25 17V7A1.75 1.75 0 0 1 3 5.25Zm0 1.5v.26l9 5.64 9-5.64v-.26H3Zm18 2.02-8.6 5.39a.75.75 0 0 1-.8 0L3 8.77V17c0 .14.11.25.25.25h17.5A.25.25 0 0 0 21 17V8.77Z"
    })
  });
}
function Footer({
  fullName = 'Baldwin',
  github = '',
  linkedin = '',
  email = '',
  credit = 'developed by Baldwin'
}) {
  const links = [{
    href: linkedin,
    label: 'LinkedIn',
    icon: /*#__PURE__*/_jsx(LinkedInIcon, {})
  }, {
    href: github,
    label: 'GitHub',
    icon: /*#__PURE__*/_jsx(GitHubIcon, {})
  }, {
    href: email ? `mailto:${email}` : '',
    label: 'Email',
    icon: /*#__PURE__*/_jsx(MailIcon, {})
  }].filter(item => Boolean(item.href));
  return /*#__PURE__*/_jsx("footer", {
    className: "mt-20 border-t border-slate-800/90 py-8",
    children: /*#__PURE__*/_jsxs("div", {
      className: "flex flex-col items-center justify-center gap-4",
      children: [/*#__PURE__*/_jsx("div", {
        className: "flex flex-wrap items-center justify-center gap-3",
        children: links.map(item => /*#__PURE__*/_jsx("a", {
          href: item.href,
          target: item.href.startsWith('mailto:') ? undefined : '_blank',
          rel: item.href.startsWith('mailto:') ? undefined : 'noreferrer',
          "aria-label": item.label,
          title: item.label,
          className: "group",
          children: /*#__PURE__*/_jsx(IconWrapper, {
            children: item.icon
          })
        }, item.label))
      }), /*#__PURE__*/_jsx("p", {
        className: "font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400",
        children: credit
      })]
    })
  });
}
export default Footer;

// Icon sources:
// GitHub and LinkedIn SVG paths were adapted from Simple Icons: https://simpleicons.org/
// Heroicons mail/envelope SVG path reference: https://heroicons.com/