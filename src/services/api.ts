import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000, // 25 seconds to fail faster and trigger fallback
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
  page?: number;
  source?: string;
}

// API Functions
export const repositoryAPI = {
  // Search repositories with query (main search endpoint)
  searchRepositories: async (query: string, params: SearchParams = {}, options: { signal?: AbortSignal } = {}): Promise<SearchResponse> => {
    const response = await api.get('/search', { 
      params: { 
        q: query, 
        sort: params.sort || 'best-match',
        order: params.order || 'desc',
        per_page: params.per_page || 30,
        page: params.page || 1,
        ...params 
      },
      signal: options.signal
    });
    return response.data;
  },

  // Get repository details
  getRepositoryDetails: async (owner: string, repo: string, options: { signal?: AbortSignal } = {}): Promise<{ success: boolean; data: Repository }> => {
    const response = await api.get(`/search/repository/${owner}/${repo}`, { signal: options.signal });
    return response.data;
  },

  // Get trending repositories
  getTrendingRepositories: async (params: TrendingParams = {}, options: { signal?: AbortSignal } = {}): Promise<SearchResponse> => {
    const response = await api.get('/search/trending', { 
      params: {
        language: params.language,
        since: params.since || 'daily',
        per_page: params.per_page || 30,
        ...params 
      },
      signal: options.signal
    });
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
    // Ignore cancellations (typing, navigation, refresh)
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError' || error?.message === 'canceled') {
      return Promise.reject(error);
    }
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle timeout errors gracefully
    if (error.code === 'ECONNABORTED') {
      const timeoutErr: any = new Error('The request took too long and timed out.');
      timeoutErr.isTimeout = true;
      timeoutErr.code = 'ECONNABORTED';
      throw timeoutErr;
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Normalize common rate limit message
    if (error.response?.status === 403 || error.response?.status === 429) {
      const rateErr: any = new Error('Service is busy right now (rate limit). Please try again shortly.');
      rateErr.isRateLimit = true;
      rateErr.status = error.response?.status;
      throw rateErr;
    }

    throw error;
  }
);

export default api;
