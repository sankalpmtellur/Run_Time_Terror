const express = require('express');
const router = express.Router();
const { extractIntent } = require('../services/gemini');
const { searchRepositories, trendingRepositories } = require('../services/github');
const { getDifficultyAnalysis } = require('../services/difficulty');

// Distribute difficulty levels within a cohort based on relative scores
function adjustDifficultyLevels(items) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const withScores = items.map((r, idx) => ({ idx, score: (r?.difficulty?.score ?? 0) }));
  withScores.sort((a, b) => b.score - a.score);
  const n = withScores.length;
  const beginnerCut = Math.floor(n * 0.35); // top 35% => Beginner
  const hardcoreCut = Math.floor(n * 0.20); // bottom 20% => Hardcore
  const hardcoreStart = n - hardcoreCut;
  const levelByIdx = new Map();
  withScores.forEach((e, i) => {
    let level = 'Intermediate';
    if (i < beginnerCut) level = 'Beginner';
    else if (i >= hardcoreStart) level = 'Hardcore';
    levelByIdx.set(e.idx, level);
  });
  return items.map((r, i) => ({
    ...r,
    difficulty: {
      ...(r.difficulty || { score: 50, description: 'Estimated', color: '#9ca3af', factors: [], maxScore: 100, recommendations: [] }),
      level: levelByIdx.get(i) || 'Intermediate',
    }
  }));
}

// Normalize pagination
function normalizePagination(page, per_page, total) {
  const p = Math.max(1, parseInt(page || '1', 10));
  const pp = Math.max(1, Math.min(100, parseInt(per_page || '30', 10)));
  const totalPages = Math.max(1, Math.ceil((total || 0) / pp));
  return { page: p, per_page: pp, total: total || 0, total_pages: totalPages };
}

router.get('/', async (req, res, next) => {
  try {
    const { q = '', page = '1', per_page = '30', sort = 'best-match', order = 'desc' } = req.query;
    const intent = await extractIntent(String(q || ''));

    // Fall back to explicit params if provided by user UI
    const language = (req.query.language || intent.language || 'all').toString();
    const domain = (req.query.domain || intent.domain || 'all').toString();
    const difficulty = (req.query.difficulty || 'all').toString();
    const hasGoodFirstIssues = String(req.query.has_good_first_issues || 'false') === 'true';

    const searchInput = {
      query: intent.queryText || q,
      page: Number(page) || 1,
      per_page: Number(per_page) || 30,
      sort: String(sort),
      order: String(order),
      filters: { language, domain, difficulty, has_good_first_issues: hasGoodFirstIssues },
      keywords: intent.keywords || [],
    };

    const gh = await searchRepositories(searchInput);
    const diffParam = (searchInput.filters.difficulty || 'all').toString().toLowerCase();
    let ensuredItems = (gh.items || []).map(repo =>
      repo && repo.difficulty ? repo : { ...repo, difficulty: getDifficultyAnalysis(repo, searchInput.filters.domain || 'all') }
    );
    // Only cohort-adjust when NOT filtering by difficulty, to keep filtering consistent across pages
    if (diffParam === 'all') {
      ensuredItems = adjustDifficultyLevels(ensuredItems);
    }

    // Difficulty filter (server-side) if explicitly requested
    let filteredItems = ensuredItems;
    if (diffParam !== 'all') {
      filteredItems = ensuredItems.filter(r => r?.difficulty?.level?.toLowerCase() === diffParam);
      // Accumulate more pages until we reach requested per_page (best effort, up to 10 more pages)
      let nextPage = (searchInput.page || 1) + 1;
      const targetCount = searchInput.per_page || 30;
      let attempts = 0;
      while (filteredItems.length < targetCount && attempts < 10) {
        const more = await searchRepositories({ ...searchInput, page: nextPage });
        let moreEnsured = (more.items || []).map(repo =>
          repo && repo.difficulty ? repo : { ...repo, difficulty: getDifficultyAnalysis(repo, searchInput.filters.domain || 'all') }
        );
        // No cohort adjust when filtering
        const moreFiltered = moreEnsured.filter(r => r?.difficulty?.level?.toLowerCase() === diffParam);
        filteredItems = filteredItems.concat(moreFiltered);
        nextPage += 1;
        attempts += 1;
        if (!more.items || more.items.length === 0) break;
      }
      // Trim to requested per_page
      filteredItems = filteredItems.slice(0, targetCount);
    }

    const pagination = normalizePagination(searchInput.page, searchInput.per_page, (diffParam !== 'all') ? filteredItems.length : (gh.total_count || 0));

    res.json({
      success: true,
      data: {
        total_count: (diffParam !== 'all') ? filteredItems.length : (gh.total_count || 0),
        incomplete_results: gh.incomplete_results || false,
        items: filteredItems,
        source: 'github',
        filters: searchInput.filters,
      },
      pagination,
      filters: searchInput.filters,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const { since = 'daily', per_page = '30', page = '1', language = 'all' } = req.query;
    const gh = await trendingRepositories({ since, per_page: Number(per_page) || 30, page: Number(page) || 1, language: String(language) });
    const diffParam = (req.query.difficulty || 'all').toString().toLowerCase();
    let ensuredItems = (gh.items || []).map(repo =>
      repo && repo.difficulty ? repo : { ...repo, difficulty: getDifficultyAnalysis(repo, 'all') }
    );
    if (diffParam === 'all') {
      ensuredItems = adjustDifficultyLevels(ensuredItems);
    }
    // Difficulty filter (server-side) is not typically used on trending, but honor param if present
    let filteredItems = ensuredItems;
    if (diffParam !== 'all') {
      filteredItems = ensuredItems.filter(r => r?.difficulty?.level?.toLowerCase() === diffParam);
      // Accumulate more pages until reaching requested per_page (best effort, up to 10 more pages)
      let nextPage = (Number(page) || 1) + 1;
      const targetCount = Math.max(1, Math.min(100, Number(per_page) || 30));
      let attempts = 0;
      while (filteredItems.length < targetCount && attempts < 10) {
        const more = await trendingRepositories({ since, per_page: targetCount, page: nextPage, language: String(language) });
        let moreEnsured = (more.items || []).map(repo =>
          repo && repo.difficulty ? repo : { ...repo, difficulty: getDifficultyAnalysis(repo, 'all') }
        );
        const moreFiltered = moreEnsured.filter(r => r?.difficulty?.level?.toLowerCase() === diffParam);
        filteredItems = filteredItems.concat(moreFiltered);
        nextPage += 1;
        attempts += 1;
        if (!more.items || more.items.length === 0) break;
      }
      filteredItems = filteredItems.slice(0, targetCount);
    }
    const pagination = normalizePagination(page, per_page, (diffParam !== 'all') ? filteredItems.length : (gh.total_count || gh.items?.length || 0));
    res.json({
      success: true,
      data: {
        total_count: (diffParam !== 'all') ? filteredItems.length : (gh.total_count || gh.items?.length || 0),
        incomplete_results: false,
        items: filteredItems,
        source: 'github',
        filters: { language: String(language), domain: 'all', difficulty: diffParam || 'all', has_good_first_issues: false },
      },
      pagination,
      filters: { language: String(language), domain: 'all', difficulty: diffParam || 'all', has_good_first_issues: false }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { searchRouter: router };
