const fetch = global.fetch || require('node-fetch');

const fs = require('fs');

function getProviderKey() {
  // Only Gemini is supported now; prefer GEMINI_API_KEY
  return process.env.GEMINI_API_KEY || null;
}

function safeSerialize(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    try { return String(obj); } catch (_) { return null; }
  }
}

// makeSystemPrompt removed — generation features disabled per project request

async function callLLM(key, prompt, max_tokens = 800) {
  // Only Gemini is supported now. This function posts prompt text to Gemini generateText endpoints.
  const geminiKey = process.env.GEMINI_API_KEY || key;
  const geminiModel = process.env.GEMINI_MODEL || 'text-bison-001';
  const apiHost = process.env.GEMINI_API_HOST || 'https://generativelanguage.googleapis.com';

  const promptText = Array.isArray(prompt)
    ? prompt.map(m => `${(m.role || 'user').toUpperCase()}: ${m.content || ''}`).join('\n')
    : String(prompt || '');

  const candidateModels = geminiModel.startsWith('models/') ? [geminiModel] : [geminiModel, `models/${geminiModel}`];
  const candidateBases = process.env.GEMINI_API_URL ? [process.env.GEMINI_API_URL] : [`${apiHost}/v1beta2/models/`, `${apiHost}/v1/models/`];
  const candidateUrls = candidateBases.flatMap(base => candidateModels.map(m => `${base}${encodeURIComponent(m)}:generateText`));

  const headersForKey = (useBearer) => ({ 'Content-Type': 'application/json', ...(useBearer ? { Authorization: `Bearer ${geminiKey}` } : {}) });

  const structuredBody = {
    prompt: { text: { text: [promptText] } },
    temperature: Number(process.env.GEMINI_TEMPERATURE || 0.2),
    maxOutputTokens: Math.min(Number(max_tokens || 800), 2048),
  };

  const fallbackBodies = [
    { prompt: promptText },
    { prompt: { text: promptText } },
    { input: promptText },
    { instances: [{ content: promptText }] },
  ];

  const tryPost = async (url, payload, useBearer) => {
    const finalUrl = useBearer ? url : (url + (url.includes('?') ? '&' : '?') + `key=${encodeURIComponent(geminiKey)}`);
    const res = await fetch(finalUrl, { method: 'POST', headers: headersForKey(useBearer), body: JSON.stringify(payload) });
    if (!res.ok) {
      let t;
      try { t = await res.json(); } catch (_) { t = await res.text(); }
      const msg = (t && t.error && (t.error.message || t.error)) ? (t.error.message || JSON.stringify(t.error)) : (typeof t === 'string' ? t : JSON.stringify(t));
      const e = new Error(`Gemini error: ${res.status} ${msg}`);
      e.status = res.status;
      e.raw = t;
      e.attempt = safeSerialize(payload);
      throw e;
    }
    return res.json();
  };

  let lastError = null;
  for (const urlBase of candidateUrls) {
    for (const useBearer of [false, true]) {
      try {
        const resp = await tryPost(urlBase, structuredBody, useBearer);
        const text = extractTextFromGeminiResponse(resp);
        return { choices: [{ message: { content: text } }] };
      } catch (err) {
        lastError = err;
        const m = String(err.message || '').toLowerCase();
        if (m.includes('requested entity was not found') || m.includes('not found') || err.status === 404) continue;
      }
    }
  }

  const attempts = [];
  for (const fb of fallbackBodies) {
    for (const urlBase of candidateUrls) {
      for (const useBearer of [false, true]) {
        try {
          const resp = await tryPost(urlBase, fb, useBearer);
          const text = extractTextFromGeminiResponse(resp);
          return { choices: [{ message: { content: text } }] };
        } catch (err) {
          attempts.push({ url: urlBase, useBearer, payload: safeSerialize(fb), error: err.raw || err.message });
          lastError = err;
        }
      }
    }
  }

  if (lastError) {
    try { lastError.attempts = attempts; } catch (_) {}
    throw lastError;
  }

  throw new Error('No Gemini endpoints responded successfully');
}

function extractTextFromGeminiResponse(resp) {
  try {
    // common shapes: { candidates: [{ content: '...' }]} or { candidates: [{ output: [{ content: [{ text: '...' }] }] }] }
    if (!resp) return '';
    if (Array.isArray(resp.candidates) && resp.candidates.length) {
      const c = resp.candidates[0];
      if (typeof c.content === 'string') return c.content;
      if (Array.isArray(c.output) && c.output.length) {
        const out = c.output[0];
        if (out && Array.isArray(out.content) && out.content.length && out.content[0].text) return out.content[0].text;
      }
      if (c.output && typeof c.output === 'string') return c.output;
    }
    if (resp.output && Array.isArray(resp.output) && resp.output.length) {
      const o = resp.output[0];
      if (o && Array.isArray(o.content) && o.content.length && o.content[0].text) return o.content[0].text;
      if (o && typeof o.text === 'string') return o.text;
    }
    if (resp.text && typeof resp.text === 'string') return resp.text;
    if (resp.outputText && typeof resp.outputText === 'string') return resp.outputText;
    // fallback to stringify
    return typeof resp === 'string' ? resp : JSON.stringify(resp);
  } catch (e) {
    return String(resp || '');
  }
}

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    // try to extract JSON substring
    const m = s.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) {
      try { return JSON.parse(m[0]); } catch (_) { return null; }
    }
    return null;
  }
}

// Local heuristic fallback generators (same logic as client-side heuristics)
// simpleFlashcardGenLocal removed — generation features disabled per project request

// simpleMCQGenLocal removed — generation features disabled per project request

// Generation endpoints and helpers removed per project request.

// expose internals for local testing
exports._test = {
};

// Diagnostics endpoint: checks for OPENAI_API_KEY and optionally makes a tiny test call
exports.diagnostics = async (req, res, next) => {
  try {
    const key = getProviderKey();
    const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
    const model = process.env.GEMINI_MODEL || 'gemini-1.0';
    if (!key) return res.json({ ok: false, keyPresent: false, message: 'LLM API key not configured on server process' });
    // Make a small low-cost call to verify the key/model works
    try {
      const messages = [
        { role: 'system', content: 'You are a concise assistant. Reply with a single word: OK' },
        { role: 'user', content: 'Ping' }
      ];
  const out = await callLLM(key, messages, 50);
      const txt = out.choices?.[0]?.message?.content || '';
      return res.json({ ok: true, keyPresent: true, provider, modelUsed: model, responseSnippet: (txt || '').slice(0, 200) });
    } catch (callErr) {
      const raw = callErr.raw || {};
      // Build a sanitized debug object to avoid circular JSON
      const debug = { raw: safeSerialize(raw) };
      try {
        if (callErr.attempt) debug.attempt = safeSerialize(callErr.attempt);
        if (callErr.attempts) debug.attempts = safeSerialize(callErr.attempts);
      } catch (_) {}
      return res.status(502).json({ ok: false, keyPresent: true, provider, error: callErr.message || String(callErr), debug });
    }
  } catch (e) {
    next(e);
  }
};
