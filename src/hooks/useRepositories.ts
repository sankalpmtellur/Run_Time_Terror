import { useState, useEffect, useCallback, useRef } from 'react';
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
  searchWithQuery: (query: string, params?: SearchParams) => Promise<void>;
  getTrendingRepositories: (params?: any) => Promise<void>;
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
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const cancelInFlight = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
  };

  const searchRepositories = useCallback(async (params: SearchParams) => {
    cancelInFlight();
    setLoading(true);
    setError(null);
    setCurrentParams(params);
    setCurrentPage(1);

    try {
      // For filtered searches without query, use trending endpoint
      const response: SearchResponse = await repositoryAPI.getTrendingRepositories({
        ...params,
        per_page: params.per_page || 30,
        page: 1,
      }, { signal: abortRef.current!.signal });

      setRepositories(response.data.items);
      setTotalCount(response.data.total_count);
      setTotalPages(response.pagination.total_pages);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        // Request was canceled; do not update state or show error
        return;
      }
      setError(err.response?.data?.error || err.message || 'Failed to fetch repositories');
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchWithQuery = useCallback(async (query: string, params: SearchParams = {}) => {
    cancelInFlight();
    setLoading(true);
    setError(null);
    setCurrentParams(params);
    setCurrentQuery(query);
    setCurrentPage(1);

    try {
      const response: SearchResponse = await repositoryAPI.searchRepositories(query, {
        ...params,
        per_page: params.per_page || 30,
        page: 1,
      }, { signal: abortRef.current!.signal });

      setRepositories(response.data.items);
      setTotalCount(response.data.total_count);
      setTotalPages(response.pagination.total_pages);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        // Request was canceled; do not update state or show error
        return;
      }
      // Fallback to trending on timeout without surfacing error to UI
      if (err?.isTimeout || err?.code === 'ECONNABORTED') {
        try {
          const fallback: SearchResponse = await repositoryAPI.getTrendingRepositories({
            language: params.language,
            domain: params.domain,
            difficulty: params.difficulty,
            per_page: params.per_page || 30,
            page: 1,
          }, { signal: abortRef.current!.signal });

          setRepositories(fallback.data.items);
          setTotalCount(fallback.data.total_count);
          setTotalPages(fallback.pagination.total_pages);
          setError(null);
        } catch (inner: any) {
          if (inner?.name === 'CanceledError' || inner?.name === 'AbortError') {
            return;
          }
          setError(inner.response?.data?.error || inner.message || 'Failed to search repositories');
          setRepositories([]);
        }
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to search repositories');
        setRepositories([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrendingRepositories = useCallback(async (params: any = {}) => {
    cancelInFlight();
    setLoading(true);
    setError(null);
    setCurrentParams(params);
    setCurrentQuery('');
    setCurrentPage(1);

    try {
      const response: SearchResponse = await repositoryAPI.getTrendingRepositories({
        ...params,
        per_page: params.per_page || 15,
        page: 1,
      }, { signal: abortRef.current!.signal });

      setRepositories(response.data.items);
      setTotalCount(response.data.total_count);
      setTotalPages(response.pagination.total_pages);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        return;
      }
      setError(err.response?.data?.error || err.message || 'Failed to fetch trending repositories');
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
      let response: SearchResponse;

      if (currentQuery) {
        // Load more search results
        if (!abortRef.current) abortRef.current = new AbortController();
        response = await repositoryAPI.searchRepositories(currentQuery, {
          ...currentParams,
          page: nextPage,
        }, { signal: abortRef.current.signal });
      } else {
        // Load more trending results
        if (!abortRef.current) abortRef.current = new AbortController();
        response = await repositoryAPI.getTrendingRepositories({
          ...currentParams,
          page: nextPage,
        }, { signal: abortRef.current.signal });
      }

      setRepositories(prev => [...prev, ...response.data.items]);
      setCurrentPage(nextPage);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        // cancelled, do not surface error
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to load more repositories');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, currentPage, currentParams, currentQuery, totalPages]);

  const refresh = useCallback(async () => {
    if (currentQuery) {
      await searchWithQuery(currentQuery, currentParams);
    } else {
      await searchRepositories(currentParams);
    }
  }, [searchWithQuery, searchRepositories, currentParams, currentQuery]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Load initial trending data
  useEffect(() => {
    // initial load
    getTrendingRepositories(initialParams);
    // cancel on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
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
    searchWithQuery,
    getTrendingRepositories,
    loadMore,
    refresh,
  };
};
