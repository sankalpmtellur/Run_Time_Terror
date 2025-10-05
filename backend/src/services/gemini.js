const { GoogleGenerativeAI } = require('@google/generative-ai');

// Simple fallback
function heuristicExtract(query) {
  const q = (query || '').toLowerCase();
  const langs = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'swift', 'kotlin', 'ruby', 'php', 'c', 'c++', 'c#', 'scala', 'r', 'dart'];
  const domains = ['web', 'frontend', 'backend', 'mobile', 'desktop', 'data', 'ai', 'ml', 'machine learning', 'devops'];
  const diffWords = {
    beginner: ['beginner', 'easy', 'starter', 'basic', 'simple', 'newbie'],
    intermediate: ['intermediate', 'medium'],
    hardcore: ['advanced', 'expert', 'hardcore', 'complex', 'professional'],
  };

  let language = 'all';
  for (const l of langs) if (q.includes(l)) { language = l; break; }

  let domain = 'all';
  for (const d of domains) {
    if (q.includes(d)) {
      domain = (d.includes('machine') || d === 'ml' || d === 'ai') ? 'data' : (d === 'frontend' ? 'web' : d);
      break;
    }
  }

  let difficulty = 'all';
  if (diffWords.beginner.some(w => q.includes(w))) difficulty = 'beginner';
  else if (diffWords.intermediate.some(w => q.includes(w))) difficulty = 'intermediate';
  else if (diffWords.hardcore.some(w => q.includes(w))) difficulty = 'hardcore';

  const stop = new Set(['find', 'me', 'project', 'projects', 'repo', 'repos', 'repository', 'repositories', 'using', 'with', 'for', 'a', 'an', 'the', 'and', 'or', 'to', 'in', 'of', 'on', 'as', 'level', 'friendly']);
  const words = q.split(/[^a-z0-9+#.]+/).filter(Boolean);
  const keywords = [];
  for (const w of words) {
    if (stop.has(w)) continue;
    if (langs.includes(w) || domains.includes(w)) continue;
    if (Object.values(diffWords).some(arr => arr.includes(w))) continue;
    if (!keywords.includes(w)) keywords.push(w);
    if (keywords.length >= 5) break;
  }

  return { language, domain, difficulty, keywords, queryText: query };
}

async function extractIntent(query) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return heuristicExtract(query);

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
Extract search intent from the user's GitHub repo prompt.
Return a JSON with:
- language: programming language or "all"
- domain: one of [web, mobile, desktop, backend, data, ai, devops, all]
- difficulty: beginner | intermediate | hardcore | all
- keywords: up to 5 useful search terms
- queryText: cleaned user prompt

Prompt: ${query}
Only return JSON.
    `.trim();

    const resp = await model.generateContent(prompt);
    const text = resp.response.text();
    const parsed = JSON.parse(text);

    const fallback = heuristicExtract(query);
    return {
      language: parsed.language || fallback.language,
      domain: parsed.domain || fallback.domain,
      difficulty: parsed.difficulty || fallback.difficulty,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : fallback.keywords,
      queryText: parsed.queryText || fallback.queryText,
    };
  } catch (err) {
    console.error('Gemini fallback:', err.message);
    return heuristicExtract(query);
  }
}

module.exports = { extractIntent };
