const axios = require('axios');

// GitHub API configuration
const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Configure axios for GitHub API
const githubApi = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Repo-Finder-API/1.0.0'
  },
  timeout: 10000
});

// Add GitHub token if available
if (GITHUB_TOKEN) {
  githubApi.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;
}

// Difficulty calculation function (same as repos)
const calculateDifficulty = (repo) => {
  const {
    stargazers_count = 0,
    forks_count = 0,
    open_issues_count = 0,
    size = 0,
    language,
    topics = [],
    has_good_first_issues = false
  } = repo;

  let score = 0;
  const factors = [];

  // Size factor (0-30 points)
  if (size < 1000) {
    score += 30;
    factors.push({ name: 'Small codebase', weight: 30, value: 'Small' });
  } else if (size < 10000) {
    score += 20;
    factors.push({ name: 'Medium codebase', weight: 20, value: 'Medium' });
  } else if (size < 50000) {
    score += 10;
    factors.push({ name: 'Large codebase', weight: 10, value: 'Large' });
  } else {
    score += 0;
    factors.push({ name: 'Very large codebase', weight: 0, value: 'Very Large' });
  }

  // Popularity factor (0-25 points)
  const totalEngagement = stargazers_count + forks_count;
  if (totalEngagement < 10) {
    score += 25;
    factors.push({ name: 'Low popularity', weight: 25, value: 'Low' });
  } else if (totalEngagement < 100) {
    score += 20;
    factors.push({ name: 'Moderate popularity', weight: 20, value: 'Moderate' });
  } else if (totalEngagement < 1000) {
    score += 10;
    factors.push({ name: 'High popularity', weight: 10, value: 'High' });
  } else {
    score += 0;
    factors.push({ name: 'Very high popularity', weight: 0, value: 'Very High' });
  }

  // Issue complexity factor (0-20 points)
  const issueRatio = open_issues_count / Math.max(stargazers_count, 1);
  if (issueRatio < 0.01) {
    score += 20;
    factors.push({ name: 'Low issue complexity', weight: 20, value: 'Low' });
  } else if (issueRatio < 0.05) {
    score += 15;
    factors.push({ name: 'Moderate issue complexity', weight: 15, value: 'Moderate' });
  } else if (issueRatio < 0.1) {
    score += 10;
    factors.push({ name: 'High issue complexity', weight: 10, value: 'High' });
  } else {
    score += 0;
    factors.push({ name: 'Very high issue complexity', weight: 0, value: 'Very High' });
  }

  // Good first issues bonus (0-15 points)
  if (has_good_first_issues) {
    score += 15;
    factors.push({ name: 'Has good first issues', weight: 15, value: 'Yes' });
  } else {
    score += 0;
    factors.push({ name: 'Has good first issues', weight: 0, value: 'No' });
  }

  // Language difficulty factor (0-10 points)
  const beginnerLanguages = ['html', 'css', 'javascript', 'python', 'ruby', 'php'];
  const intermediateLanguages = ['java', 'c#', 'go', 'rust', 'swift', 'kotlin'];
  const advancedLanguages = ['c', 'c++', 'assembly', 'haskell', 'ocaml', 'erlang'];

  if (language) {
    const lang = language.toLowerCase();
    if (beginnerLanguages.includes(lang)) {
      score += 10;
      factors.push({ name: 'Beginner-friendly language', weight: 10, value: language });
    } else if (intermediateLanguages.includes(lang)) {
      score += 5;
      factors.push({ name: 'Intermediate language', weight: 5, value: language });
    } else if (advancedLanguages.includes(lang)) {
      score += 0;
      factors.push({ name: 'Advanced language', weight: 0, value: language });
    } else {
      score += 7;
      factors.push({ name: 'Unknown language difficulty', weight: 7, value: language });
    }
  } else {
    score += 5;
    factors.push({ name: 'No primary language', weight: 5, value: 'None' });
  }

  // Determine difficulty level
  let level, description, color;
  if (score >= 80) {
    level = 'Beginner';
    description = 'Perfect for newcomers to open source';
    color = '#28a745';
  } else if (score >= 50) {
    level = 'Intermediate';
    description = 'Suitable for developers with some experience';
    color = '#ffc107';
  } else {
    level = 'Hardcore';
    description = 'Challenging for experienced developers';
    color = '#dc3545';
  }

  return {
    level,
    score: Math.min(100, Math.max(0, score)),
    description,
    color,
    factors,
    maxScore: 100,
    recommendations: generateRecommendations(level)
  };
};

const generateRecommendations = (level) => {
  const recommendations = [];

  if (level === 'Beginner') {
    recommendations.push('Great for first-time contributors');
    recommendations.push('Start with documentation or simple bug fixes');
    recommendations.push('Look for issues labeled "good first issue"');
  } else if (level === 'Intermediate') {
    recommendations.push('Good for developers with some experience');
    recommendations.push('Consider contributing to features or improvements');
    recommendations.push('Review existing code before contributing');
  } else {
    recommendations.push('Challenging project for experienced developers');
    recommendations.push('Thoroughly understand the codebase before contributing');
    recommendations.push('Consider starting with documentation or tests');
  }

  return recommendations;
};

// Domain filters
const getDomainFilters = (domain) => {
  const domainFilters = {
    web: ['frontend', 'web', 'ui', 'ux', 'react', 'vue', 'angular', 'svelte', 'html', 'css', 'javascript'],
    mobile: ['mobile', 'ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin'],
    desktop: ['desktop', 'gui', 'electron', 'qt', 'gtk', 'win32'],
    backend: ['backend', 'api', 'server', 'database', 'microservice', 'rest', 'graphql'],
    data: ['data', 'ml', 'ai', 'analytics', 'visualization', 'pandas', 'numpy', 'tensorflow'],
    devops: ['devops', 'ci', 'cd', 'docker', 'kubernetes', 'terraform', 'ansible'],
    game: ['game', 'gaming', 'unity', 'unreal', 'opengl', 'directx', 'sdl'],
    blockchain: ['blockchain', 'crypto', 'ethereum', 'bitcoin', 'defi', 'nft']
  };
  
  return domainFilters[domain.toLowerCase()] || [];
};

// Check good first issues
const checkGoodFirstIssues = (repo) => {
  return repo.topics?.some(topic => 
    topic.toLowerCase().includes('good-first-issue') ||
    topic.toLowerCase().includes('beginner') ||
    topic.toLowerCase().includes('easy')
  ) || false;
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      q,
      language = 'all',
      domain = 'all',
      difficulty = 'all',
      has_good_first_issues = false,
      sort = 'best-match',
      order = 'desc',
      per_page = 10,
      page = 1
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Build search query
    let searchQuery = q;
    
    if (language !== 'all') {
      searchQuery += ` language:${language}`;
    }
    
    if (has_good_first_issues === 'true') {
      searchQuery += ' label:"good first issue"';
    }
    
    // Add domain-specific search terms
    if (domain !== 'all') {
      const domainTerms = getDomainFilters(domain);
      if (domainTerms.length > 0) {
        searchQuery += ` ${domainTerms.slice(0, 2).join(' ')}`;
      }
    }

    console.log(`GitHub search query: ${searchQuery}`);

    const response = await githubApi.get('/search/repositories', {
      params: {
        q: searchQuery,
        sort,
        order,
        per_page: Math.min(parseInt(per_page), 100),
        page: parseInt(page)
      }
    });

    // Process repositories and add difficulty analysis
    const repositories = response.data.items.map(repo => {
      const baseRepo = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
          type: repo.owner.type
        },
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        size: repo.size,
        default_branch: repo.default_branch,
        topics: repo.topics || [],
        visibility: repo.visibility || (repo.private ? 'private' : 'public'),
        license: repo.license ? {
          key: repo.license.key,
          name: repo.license.name,
          spdx_id: repo.license.spdx_id,
          url: repo.license.url
        } : null,
        score: repo.score,
        has_good_first_issues: checkGoodFirstIssues(repo),
        source: 'github'
      };
      
      // Calculate difficulty
      baseRepo.difficulty = calculateDifficulty(baseRepo);
      
      return baseRepo;
    });

    // Filter by difficulty if specified
    let filteredRepos = repositories;
    if (difficulty !== 'all') {
      filteredRepos = repositories.filter(repo => 
        repo.difficulty.level.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Sort by difficulty score if requested
    if (sort === 'difficulty') {
      filteredRepos.sort((a, b) => b.difficulty.score - a.difficulty.score);
    }

    const result = {
      success: true,
      data: {
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results,
        items: filteredRepos,
        source: 'github',
        filters: {
          language: language || 'all',
          domain: domain || 'all',
          difficulty: difficulty || 'all',
          has_good_first_issues: has_good_first_issues === 'true'
        }
      },
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: response.data.total_count || 0,
        total_pages: Math.ceil((response.data.total_count || 0) / parseInt(per_page))
      }
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error searching repositories:', error.message);
    
    let errorMessage = 'Failed to search repositories. Please try again later.';
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'API error';
      
      if (status === 401) {
        errorMessage = 'GitHub API authentication required. Please add a GITHUB_TOKEN to your environment variables.';
      } else if (status === 403) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (status === 422) {
        errorMessage = `Invalid search parameters: ${message}`;
      } else if (status === 404) {
        errorMessage = 'No repositories found.';
      } else {
        errorMessage = `API error: ${message}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
