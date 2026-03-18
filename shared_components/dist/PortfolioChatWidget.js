import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function SparkIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: "h-5 w-5 fill-current",
    children: /*#__PURE__*/_jsx("path", {
      d: "M12 3.25c-4.83 0-8.75 3.48-8.75 7.78 0 2.5 1.31 4.71 3.34 6.14v3.08l3.04-1.66c.72.15 1.46.22 2.23.22 4.83 0 8.75-3.48 8.75-7.78S16.83 3.25 12 3.25Zm-2.92 6.84a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm2.92 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm2.92 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
    })
  });
}
function CloseIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: "h-5 w-5 fill-current",
    children: /*#__PURE__*/_jsx("path", {
      d: "m18.3 6.76-1.06-1.06L12 10.94 6.76 5.7 5.7 6.76 10.94 12 5.7 17.24l1.06 1.06L12 13.06l5.24 5.24 1.06-1.06L13.06 12l5.24-5.24Z"
    })
  });
}
function SendIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: "h-4 w-4 fill-current",
    children: /*#__PURE__*/_jsx("path", {
      d: "M3.35 20.65 21 12 3.35 3.35 3.3 10.1l12.2 1.9-12.2 1.9.05 6.75Z"
    })
  });
}
function BotBubbleIcon() {
  return /*#__PURE__*/_jsx("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: "h-4 w-4 fill-current",
    children: /*#__PURE__*/_jsx("path", {
      d: "M12 3.5c-4.97 0-9 3.58-9 8 0 2.57 1.37 4.85 3.5 6.31V21l3.17-1.73c.75.16 1.53.23 2.33.23 4.97 0 9-3.58 9-8s-4.03-8-9-8Zm-3 6.5a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 9 10Zm3 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm3 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
    })
  });
}
function PortfolioChatWidget({
  apiUrl,
  title = 'Ask About Portfolio',
  intro = 'Ask about projects, stack, iOS apps, or experience shown on this site.',
  placeholder = 'Ask about portfolio...',
  suggestedPrompts = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);
  const [messages, setMessages] = useState([{
    id: 'intro',
    role: 'assistant',
    text: intro
  }]);
  const promptChips = useMemo(() => suggestedPrompts.slice(0, 4), [suggestedPrompts]);
  useEffect(() => {
    if (!isOpen || !messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [isOpen, messages, isLoading]);
  async function sendMessage(rawMessage) {
    const message = rawMessage.trim();
    if (!message || isLoading) return;
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message
    }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message
        })
      });
      const data = await response.json().catch(() => ({}));
      const answer = response.ok ? data.answer : data.error || 'The portfolio assistant is unavailable right now.';
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: answer || 'I only answer questions about this portfolio.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: 'The portfolio assistant is unavailable right now.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:bottom-8 md:right-8",
    children: [isOpen && /*#__PURE__*/_jsxs("section", {
      className: "w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/95 shadow-[0_20px_70px_rgba(2,6,23,0.55)] backdrop-blur overscroll-contain",
      children: [/*#__PURE__*/_jsx("div", {
        className: "border-b border-slate-800 px-5 py-4",
        children: /*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsx("span", {
            className: "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-300",
            children: /*#__PURE__*/_jsx(BotBubbleIcon, {})
          }), /*#__PURE__*/_jsxs("div", {
            className: "min-w-0",
            children: [/*#__PURE__*/_jsx("h2", {
              className: "font-sans text-base font-bold text-slate-100",
              children: title
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-1 text-xs leading-5 text-slate-400",
              children: "Assistant"
            })]
          })]
        })
      }), /*#__PURE__*/_jsxs("div", {
        ref: messagesRef,
        className: "max-h-[26rem] space-y-3 overflow-y-auto overscroll-contain px-5 py-4",
        children: [promptChips.length > 0 && messages.length === 1 && /*#__PURE__*/_jsx("div", {
          className: "flex flex-wrap gap-2",
          children: promptChips.map(prompt => /*#__PURE__*/_jsx("button", {
            type: "button",
            className: "rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200",
            onClick: () => sendMessage(prompt),
            children: prompt
          }, prompt))
        }), messages.map(message => /*#__PURE__*/_jsx("div", {
          className: `max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-cyan-300/14 text-cyan-50' : 'bg-slate-900 text-slate-200'} break-words [overflow-wrap:anywhere]`,
          children: message.text
        }, message.id)), isLoading && /*#__PURE__*/_jsx("div", {
          className: "max-w-[88%] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-400",
          children: "Thinking..."
        })]
      }), /*#__PURE__*/_jsx("form", {
        className: "border-t border-slate-800 px-4 py-4",
        onSubmit: handleSubmit,
        children: /*#__PURE__*/_jsxs("div", {
          className: "flex items-end gap-3",
          children: [/*#__PURE__*/_jsx("textarea", {
            value: input,
            onChange: event => setInput(event.target.value),
            rows: 2,
            placeholder: placeholder,
            className: "max-h-[48px] flex-1 resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
          }), /*#__PURE__*/_jsx("button", {
            type: "submit",
            disabled: isLoading || !input.trim(),
            className: "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50",
            "aria-label": "Send message",
            children: /*#__PURE__*/_jsx(SendIcon, {})
          })]
        })
      })]
    }), /*#__PURE__*/_jsx("button", {
      type: "button",
      className: "inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-cyan-200 shadow-[0_16px_50px_rgba(8,145,178,0.18)] backdrop-blur transition hover:border-cyan-300/55 hover:text-cyan-100",
      onClick: () => setIsOpen(prev => !prev),
      children: /*#__PURE__*/_jsx("span", {
        className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/12",
        children: isOpen ? /*#__PURE__*/_jsx(CloseIcon, {}) : /*#__PURE__*/_jsx(SparkIcon, {})
      })
    })]
  });
}
export default PortfolioChatWidget;