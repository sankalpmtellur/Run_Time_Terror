import { useState, useEffect, useCallback } from 'react';
import { repositoryAPI, SearchParams, SearchResponse, Repository } from '../services/api';

interface UseRepositoriesReturn {
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  searchRepositories: (params: SearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useRepositories = (initialParams: SearchParams = {}): UseRepositoriesReturn => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentParams, setCurrentParams] = useState<SearchParams>(initialParams);

  const searchRepositories = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setCurrentParams(params);
    setCurrentPage(1);

    try {
      const response: SearchResponse = await repositoryAPI.getRepositories({
        ...params,
        page: 1,
      });

      setRepositories(response.data.items);
      setTotalCount(response.data.total_count);
      setTotalPages(response.pagination.total_pages);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch repositories');
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response: SearchResponse = await repositoryAPI.getRepositories({
        ...currentParams,
        page: nextPage,
      });

      setRepositories(prev => [...prev, ...response.data.items]);
      setCurrentPage(nextPage);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load more repositories');
    } finally {
      setLoading(false);
    }
  }, [loading, currentPage, currentParams, totalPages]);

  const refresh = useCallback(async () => {
    await searchRepositories(currentParams);
  }, [searchRepositories, currentParams]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Load initial data
  useEffect(() => {
    searchRepositories(initialParams);
  }, []);

  return {
    repositories,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchRepositories,
    loadMore,
    refresh,
  };
};
