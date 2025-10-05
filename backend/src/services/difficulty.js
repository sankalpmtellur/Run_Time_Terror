// Lightweight difficulty calculator to match frontend expectations
// Produces an object: { level: 'Beginner'|'Intermediate'|'Hardcore', score: 0-100, description, color, factors: [], maxScore, domainAdjustment?, recommendations? }

function calculateBase(repo) {
  const {
    stargazers_count = 0,
    forks_count = 0,
    open_issues_count = 0,
    size = 0,
    language,
    topics = [],
    has_good_first_issues = false,
  } = repo || {};

  let score = 0;
  const factors = [];

  // Size (boost small projects to surface Beginner)
  if (size < 1000) { score += 25; factors.push({ name: 'Small codebase', weight: 25, value: 'Small' }); }
  else if (size < 10000) { score += 15; factors.push({ name: 'Medium codebase', weight: 15, value: 'Medium' }); }
  else if (size < 50000) { score += 8; factors.push({ name: 'Large codebase', weight: 8, value: 'Large' }); }
  else { score += 0; factors.push({ name: 'Very large codebase', weight: 0, value: 'Very Large' }); }

  // Popularity (lower engagement => easier to contribute)
  const engagement = stargazers_count + forks_count;
  if (engagement < 10) { score += 25; factors.push({ name: 'Low popularity', weight: 25, value: 'Low' }); }
  else if (engagement < 100) { score += 15; factors.push({ name: 'Moderate popularity', weight: 15, value: 'Moderate' }); }
  else if (engagement < 1000) { score += 8; factors.push({ name: 'High popularity', weight: 8, value: 'High' }); }
  else { score += 0; factors.push({ name: 'Very high popularity', weight: 0, value: 'Very High' }); }

  // Issue complexity (retuned)
  const issueRatio = open_issues_count / Math.max(stargazers_count, 1);
  if (issueRatio < 0.01) { score += 15; factors.push({ name: 'Low issue complexity', weight: 15, value: 'Low' }); }
  else if (issueRatio < 0.05) { score += 10; factors.push({ name: 'Moderate issue complexity', weight: 10, value: 'Moderate' }); }
  else if (issueRatio < 0.1) { score += 5; factors.push({ name: 'High issue complexity', weight: 5, value: 'High' }); }
  else { score += 0; factors.push({ name: 'Very high issue complexity', weight: 0, value: 'Very High' }); }

  // Heuristic: very small and low-star projects are Beginner-friendly
  if (size < 5000 && stargazers_count < 50) {
    score += 15;
    factors.push({ name: 'Small & low-star project', weight: 15, value: 'Beginner-friendly' });
  }

  // Good first issues bonus (retuned)
  if (has_good_first_issues || (Array.isArray(topics) && topics.some(t => /good[- ]first[- ]issue/i.test(t)))) {
    score += 10; factors.push({ name: 'Has good first issues', weight: 10, value: 'Yes' });
  } else {
    factors.push({ name: 'Has good first issues', weight: 0, value: 'No' });
  }

  // Language
  const beginnerLangs = ['html', 'css', 'javascript', 'python', 'ruby', 'php', 'typescript'];
  const intermediateLangs = ['java', 'c#', 'go', 'rust', 'swift', 'kotlin'];
  const advancedLangs = ['c', 'c++', 'assembly', 'haskell', 'ocaml', 'erlang'];
  if (language) {
    const lang = String(language).toLowerCase();
    if (beginnerLangs.includes(lang)) { score += 10; factors.push({ name: 'Beginner-friendly language', weight: 10, value: language }); }
    else if (intermediateLangs.includes(lang)) { score += 4; factors.push({ name: 'Intermediate language', weight: 4, value: language }); }
    else if (advancedLangs.includes(lang)) { factors.push({ name: 'Advanced language', weight: 0, value: language }); }
    else { score += 5; factors.push({ name: 'Unknown language difficulty', weight: 5, value: language }); }
  } else {
    score += 2; factors.push({ name: 'No primary language', weight: 2, value: 'None' }); }

  // Beginner topic hints
  const beginnerHints = ['beginner', 'tutorial', 'starter', 'examples'];
  if (Array.isArray(topics) && topics.some(t => beginnerHints.includes(String(t).toLowerCase()))) {
    score += 10;
    factors.push({ name: 'Beginner topic hints', weight: 10, value: 'Topics' });
  }

  let level, description, color;
  // Adjusted thresholds to spread categories better
  if (score >= 50) { level = 'Beginner'; description = 'Perfect for newcomers to open source'; color = '#28a745'; }
  else if (score >= 30) { level = 'Intermediate'; description = 'Suitable for developers with some experience'; color = '#ffc107'; }
  else { level = 'Hardcore'; description = 'Challenging for experienced developers'; color = '#dc3545'; }

  const recommendations = [];
  if (level === 'Beginner') {
    recommendations.push('Great for first-time contributors');
    if (has_good_first_issues) recommendations.push('Check issues labeled "good first issue"');
  } else if (level === 'Intermediate') {
    recommendations.push('Good for developers with some experience');
    recommendations.push('Consider contributing to features or improvements');
  } else {
    recommendations.push('Challenging project for experienced developers');
    recommendations.push('Start with documentation or tests to get familiar');
  }

  return { level, score: Math.min(100, Math.max(0, score)), description, color, factors, maxScore: 100, recommendations };
}

function getDifficultyAnalysis(repo, domain) {
  const base = calculateBase(repo);
  // Optional domain adjustment (lightweight)
  if (domain && domain !== 'all') {
    const lang = (repo.language || '').toLowerCase();
    let bonus = 0;
    if (domain === 'web' && ['html','css','javascript','typescript'].includes(lang)) bonus = 10;
    if (domain === 'data' && ['python','r','scala','julia'].includes(lang)) bonus = 10;
    const score = Math.min(100, base.score + bonus);
    let level = base.level;
    if (score >= 80) level = 'Beginner'; else if (score >= 50) level = 'Intermediate'; else level = 'Hardcore';
    return { ...base, score, level, domainAdjustment: { domain, score: bonus, level } };
  }
  return base;
}

module.exports = { getDifficultyAnalysis };
