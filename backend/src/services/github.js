const axios = require('axios');
const { getDifficultyAnalysis } = require('./difficulty');

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const github = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Repo-Finder/1.0.0',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
  timeout: 10000,
});

function buildQuery({ query, keywords = [], filters = {} }) {
  const parts = [];
  // base query text (cleaned)
  if (query && String(query).trim().length) parts.push(String(query).trim());
  // add keywords
  if (keywords && keywords.length) parts.push(keywords.slice(0, 5).join(' '));
  // language
  if (filters.language && filters.language !== 'all') parts.push(`language:${filters.language}`);
  // domain hints
  if (filters.domain && filters.domain !== 'all') {
    const d = String(filters.domain).toLowerCase();
    if (d === 'web' || d === 'frontend') parts.push('react OR vue OR angular OR svelte');
    else if (d === 'mobile') parts.push('react-native OR flutter OR swift OR kotlin');
    else if (d === 'backend') parts.push('api OR server OR backend');
    else if (d === 'data' || d === 'ai') parts.push('machine learning OR data OR ai OR ml');
  }
  // difficulty-aware query hints
  const diff = (filters.difficulty || 'all').toString().toLowerCase();
  if (diff === 'beginner') {
    // favor smaller, less popular repos that are easier to contribute
    parts.push('stars:<200');
    parts.push('forks:<200');
    parts.push('size:<50000');
  } else if (diff === 'hardcore') {
    // favor larger, more popular challenging repos
    parts.push('stars:>500');
    parts.push('size:>20000');
  }
  // good first issues signal via topic
  if (filters.has_good_first_issues) parts.push('topic:"good-first-issue"');
  // broaden search scope
  parts.push('in:name,description,readme');
  const q = parts.filter(Boolean).join(' ');
  return q;
}

async function searchRepositories({ query, keywords, filters, sort = 'best-match', order = 'desc', per_page = 30, page = 1 }) {
  const q = buildQuery({ query, keywords, filters });
  const diff = (filters?.difficulty || 'all').toString().toLowerCase();

  let finalSort = sort;
  let finalOrder = order;
  if (diff === 'beginner') {
    finalSort = 'updated'; finalOrder = 'desc';
  } else if (diff === 'hardcore') {
    finalSort = 'stars'; finalOrder = 'desc';
  }

  const params = { q, sort: finalSort, order: finalOrder, per_page: Math.min(100, per_page), page };
  const { data } = await github.get('/search/repositories', { params });

  const items = (data.items || []).map(repo => {
    const hasGood = Array.isArray(repo.topics) && repo.topics.some(t => /good[- ]first[- ]issue/i.test(t));
    const base = { ...repo, has_good_first_issues: hasGood };
    const difficulty = getDifficultyAnalysis({
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      size: repo.size,
      language: repo.language,
      topics: repo.topics || [],
      has_good_first_issues: hasGood,
    }, filters?.domain || 'all');
    return { ...base, difficulty };
  });

  // 🔥 Sort items by difficulty score ascending
  items.sort((a, b) => (a.difficulty?.score ?? 0) - (b.difficulty?.score ?? 0));

  return { total_count: data.total_count, incomplete_results: data.incomplete_results, items };
}


async function trendingRepositories({ since = 'daily', per_page = 30, page = 1, language = 'all' }) {
  const date = new Date();
  if (since === 'weekly') date.setDate(date.getDate() - 7);
  else if (since === 'monthly') date.setMonth(date.getMonth() - 1);
  else date.setDate(date.getDate() - 1);
  const iso = date.toISOString().split('T')[0];
  const filters = {};
  if (language && language !== 'all') filters.language = language;
  const q = [buildQuery({ query: '', keywords: [], filters }), `pushed:>=${iso}`].filter(Boolean).join(' ');
  const params = { q, sort: 'stars', order: 'desc', per_page: Math.min(100, per_page), page };
  const { data } = await github.get('/search/repositories', { params });
  const items = (data.items || []).map(repo => {
    const hasGood = Array.isArray(repo.topics) && repo.topics.some(t => /good[- ]first[- ]issue/i.test(t));
    const base = {
      ...repo,
      has_good_first_issues: hasGood,
    };
    const difficulty = getDifficultyAnalysis({
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      size: repo.size,
      language: repo.language,
      topics: repo.topics || [],
      has_good_first_issues: hasGood,
    }, 'all');
    return { ...base, difficulty };
  });
  return { total_count: data.total_count, items };
}

module.exports = { searchRepositories, trendingRepositories };
