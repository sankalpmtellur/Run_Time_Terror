import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  description: string;
  html_url: string;
  clone_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  visibility: string;
  has_good_first_issues: boolean;
  difficulty: {
    level: 'Beginner' | 'Intermediate' | 'Hardcore';
    score: number;
    description: string;
    color: string;
    factors: Array<{
      name: string;
      weight: number;
      value: string;
    }>;
    recommendations: string[];
  };
}

export interface SearchParams {
  language?: string;
  domain?: string;
  difficulty?: string;
  has_good_first_issues?: boolean;
  sort?: string;
  order?: string;
  per_page?: number;
  page?: number;
  source?: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    total_count: number;
    incomplete_results: boolean;
    items: Repository[];
    source: string;
    filters: {
      language: string;
      domain: string;
      difficulty: string;
      has_good_first_issues: boolean;
    };
  };
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface TrendingParams {
  language?: string;
  domain?: string;
  difficulty?: string;
  since?: string;
  per_page?: number;
  source?: string;
}

// API Functions
export const repositoryAPI = {
  // Get filtered repositories (main endpoint)
  getRepositories: async (params: SearchParams = {}): Promise<SearchResponse> => {
    const response = await api.get('/repos', { params });
    return response.data;
  },

  // Search repositories with query
  searchRepositories: async (query: string, params: SearchParams = {}): Promise<SearchResponse> => {
    const response = await api.get('/search', { 
      params: { 
        q: query, 
        ...params 
      } 
    });
    return response.data;
  },

  // Get trending repositories
  getTrendingRepositories: async (params: TrendingParams = {}): Promise<SearchResponse> => {
    const response = await api.get('/search/trending', { params });
    return response.data;
  },

  // Get repository details
  getRepositoryDetails: async (owner: string, repo: string): Promise<{ success: boolean; data: Repository }> => {
    const response = await api.get(`/search/repository/${owner}/${repo}`);
    return response.data;
  },

  // Health check
  getHealth: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default api;
