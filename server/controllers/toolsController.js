const fetch = global.fetch || require('node-fetch');

const fs = require('fs');

function getProviderKey() {
  // LLM features disabled per project request
  return null;
}

function safeSerialize(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    try { return String(obj); } catch (_) { return null; }
  }
}

// makeSystemPrompt removed — generation features disabled per project request

async function callLLM() {
  // Disabled. LLM integrations have been removed per project directive.
  throw new Error('LLM support is disabled on this server');
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
  return res.json({ ok: false, message: 'LLM integrations are disabled on this server' });
};
