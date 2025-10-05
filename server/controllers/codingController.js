exports.updateChallenge = async (req, res) => {
  try {
    const updated = await CodingChallenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update challenge' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    await CodingChallenge.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete challenge' });
  }
};
const axios = require('axios');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const CodingChallenge = require('../models/CodingChallenge');
const Submission = require('../models/Submission');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';

exports.listChallenges = async (req, res) => {
  const { q, difficulty, tag, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = tag;
  if (q) {
    const rx = new RegExp(String(q).trim(), 'i');
    filter.$or = [{ statement: rx }, { constraints: rx }];
  }
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
  const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'moderator');
  const projection = isAdmin ? undefined : 'statement constraints difficulty tags';
  const [items, total] = await Promise.all([
    CodingChallenge.find(filter).select(projection).sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize),
    CodingChallenge.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, limit: pageSize });
};

exports.createChallenge = async (req, res) => {
  const challenge = await CodingChallenge.create(req.body);
  res.status(201).json(challenge);
};

async function judgeRun(language_id, source_code, input, expected_output, headers) {
  const payload = { language_id, source_code, stdin: input };
  if (typeof expected_output === 'string') payload.expected_output = expected_output;
  const resp = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, payload, { headers });
  return resp.data;
}

async function runAgainstCases(language_id, source_code, cases = [], headers) {
  const results = [];
  for (let i = 0; i < Math.min(cases.length, 25); i++) {
    const tc = cases[i] || {};
    try {
      const data = await judgeRun(language_id, source_code, tc.input ?? '', tc.output ?? undefined, headers);
      const status = data?.status?.description || 'Unknown';
      const stdout = data?.stdout ?? '';
      const passed = typeof tc.output === 'string' ? (stdout?.trim() === String(tc.output).trim()) : (data?.status?.id === 3);
      results.push({ index: i + 1, status, time: data?.time, memory: data?.memory, stdout, expected: tc.output, passed });
    } catch (e) {
      results.push({ index: i + 1, status: 'Error', passed: false, error: e?.response?.data || e?.message });
    }
  }
  const allPassed = results.length > 0 && results.every(r => r.passed);
  return { results, allPassed };
}

async function runLocally(language_id, source_code, stdin = '') {
  // Map language ids to runtimes we support locally
  // 63 -> node, 71 -> python
  const TMP_DIR = os.tmpdir();
  let ext = 'txt';
  let cmd = null;
  let args = [];
  if (String(language_id) === '63') { // JavaScript
    ext = 'js';
    cmd = 'node';
  } else if (String(language_id) === '71') { // Python
    ext = 'py';
    // prefer python3 if available
    cmd = 'python';
  } else {
    return { error: 'Local execution not supported for this language. Use judge service.' };
  }

  const filename = path.join(TMP_DIR, `skillup_run_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
  await writeFile(filename, source_code, 'utf8');
  if (cmd === 'python') {
    // try python3 first if available
    // leave as 'python' and rely on environment; fallback handled by child_process error
  }

  return new Promise((resolve) => {
    const options = { timeout: 5000, maxBuffer: 1024 * 1024 };
    const child = execFile(cmd, [filename], options, async (err, stdout, stderr) => {
      try { await unlink(filename); } catch (e) {}
      if (err) {
        // err may include timeout or non-zero exit
        const isTimeout = err.killed || (err.code === null && err.signal);
        const message = isTimeout ? 'Execution timed out' : (err.message || 'Execution error');
        return resolve({ status: { description: message }, stdout: stdout || '', stderr: stderr || (err.stderr || String(err)) });
      }
      return resolve({ status: { description: 'OK' }, stdout: stdout || '', stderr: stderr || '' });
    });
    // if stdin provided, write and end
    if (stdin) {
      try { child.stdin.write(String(stdin)); } catch (e) {}
      try { child.stdin.end(); } catch (e) {}
    }
  });
}

exports.runCode = async (req, res) => {
  const { challengeId, language_id, source_code, stdin } = req.body;
  console.info('[coding/run] payload', { challengeId: !!challengeId, language_id, hasSource: Boolean(source_code) });
  const headers = { 'Content-Type': 'application/json' };
  const rawKey = process.env.JUDGE0_API_KEY || '';
  const apiKey = rawKey.trim();
  const hasKey = Boolean(apiKey);
  if (hasKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    if ((JUDGE0_URL || '').includes('rapidapi.com')) headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  try {
    // If a challengeId is provided, run sample tests as before
    if (challengeId) {
      const challenge = await CodingChallenge.findById(challengeId).lean();
      if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
      const sample = Array.isArray(challenge.testCases) ? challenge.testCases.slice(0, Math.min(2, challenge.testCases.length)) : [];
      if (!hasKey) {
        return res.json({ results: sample.map((_, i) => ({ index: i + 1, status: 'Mocked', passed: true })), allPassed: true, mocked: true });
      }
      const out = await runAgainstCases(language_id, source_code, sample, headers);
      return res.json(out);
    }

    // For ad-hoc runs (no challengeId) prefer local execution to support simple editor Run
    // This avoids depending on Judge0 subscription for quick in-browser testing of Node/Python
    {
      console.info('[coding/run] ad-hoc run - using local runner');
      console.log('[coding/run] DEBUG: entering ad-hoc local-run branch');
      const local = await runLocally(language_id, source_code, stdin ?? '');
      if (local?.error) {
        console.warn('[coding/run] local run error', local.error);
        return res.status(400).json({ message: local.error });
      }
      console.info('[coding/run] local run finished', { stdout: String(local.stdout).slice(0,200), stderr: String(local.stderr).slice(0,200) });
      return res.json(local);
    }
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ message: 'Judge error', detail: e.response?.data || e.message });
  }
};

exports.submitCode = async (req, res) => {
  const { challengeId, language_id, source_code } = req.body;
  const challenge = await CodingChallenge.findById(challengeId).lean();
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  const testCases = Array.isArray(challenge.testCases) ? challenge.testCases : [];
  const headers = { 'Content-Type': 'application/json' };
  const rawKey = process.env.JUDGE0_API_KEY || '';
  const apiKey = rawKey.trim();
  const hasKey = Boolean(apiKey);
  if (hasKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    if ((JUDGE0_URL || '').includes('rapidapi.com')) headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  try {
    let out;
    if (!hasKey) {
      out = { results: testCases.map((_, i) => ({ index: i + 1, status: 'Mocked', passed: true })), allPassed: true, mocked: true };
    } else {
      out = await runAgainstCases(language_id, source_code, testCases, headers);
    }
    const verdict = out.allPassed ? 'Accepted' : 'Wrong Answer';
    const submission = await Submission.create({
      userId: req.user?.id,
      challengeId,
      code: source_code,
      language: String(language_id),
      result: verdict,
      runtime: String(out.results?.reduce((acc, r) => Math.max(acc, Number(r.time || 0)), 0)),
      timestamp: new Date(),
    });
    return res.json({ submissionId: submission._id, verdict, ...out });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ message: 'Judge error', detail: e.response?.data || e.message });
  }
};

exports.mySubmissions = async (req, res) => {
  try {
    const items = await Submission.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load submissions' });
  }
};
