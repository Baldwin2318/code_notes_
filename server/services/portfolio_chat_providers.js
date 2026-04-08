import critical_data from '../../shared_data/server_critical_data.js';

export const DEFAULT_PORTFOLIO_CHAT_PROVIDER = 'gemini';

const SUPPORTED_PORTFOLIO_CHAT_PROVIDERS = new Set(['gemini', 'grok']);
const XAI_API_BASE_URL = 'https://api.x.ai/v1';

function buildPortfolioSystemPrompt(chatFallback) {
  return [
    "You are a portfolio assistant for Baldwin's personal website.",
    'Answer only using the provided portfolio data and GitHub account data.',
    `If the answer is not supported by the provided data, reply exactly with: ${chatFallback}`,
    'You may answer questions about Baldwin, his portfolio, his GitHub profile, his GitHub repositories, and GitHub activity totals when those details are present in the provided data.',
    'Do not use outside knowledge.',
    'Do not guess, infer missing facts, or invent projects, dates, skills, employers, or GitHub stats that are not present in the provided data.',
    'Keep responses concise and practical.'
  ].join(' ');
}

function extractXaiMessageContent(content) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.type === 'text') return item.text || '';
        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

export function normalizePortfolioChatProvider(rawProvider) {
  const normalized = String(rawProvider || DEFAULT_PORTFOLIO_CHAT_PROVIDER).trim().toLowerCase();
  return SUPPORTED_PORTFOLIO_CHAT_PROVIDERS.has(normalized)
    ? normalized
    : DEFAULT_PORTFOLIO_CHAT_PROVIDER;
}

export function isXaiQuotaExceeded(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.status === 429 || message.includes('quota') || message.includes('rate limit');
}

export async function askXaiAboutPortfolio(message, context, chatFallback) {
  if (!critical_data.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is missing. Add it to the server environment to enable the Grok portfolio assistant.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${XAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${critical_data.XAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: critical_data.XAI_MODEL,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content: buildPortfolioSystemPrompt(chatFallback)
          },
          {
            role: 'user',
            content: `Portfolio data:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${message}`
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data?.error?.message || 'xAI request failed.');
      error.status = response.status;
      throw error;
    }

    const answer = extractXaiMessageContent(data?.choices?.[0]?.message?.content);
    return {
      answer: answer || chatFallback,
      provider: 'grok'
    };
  } finally {
    clearTimeout(timeout);
  }
}
