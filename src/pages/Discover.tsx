import { useState, useMemo } from 'react';
import { Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useRepositories } from '../hooks/useRepositories';
import RepositoryCard from '../components/RepositoryCard';

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestedQueries = [
    'react components',
    'machine learning python',
    'web development',
    'mobile app development',
    'data visualization',
    'API development',
    'game development',
    'blockchain projects',
    'devops tools',
    'testing frameworks',
    'UI/UX libraries',
    'database management'
  ];

  const {
    repositories,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    searchWithQuery,
    getTrendingRepositories,
    loadMore,
    refresh,
  } = useRepositories();

  const handleSearch = () => {
    getTrendingRepositories({ per_page: 20 });
  };

  const handleSearchWithQuery = () => {
    if (!searchTerm.trim()) {
      handleSearch();
      return;
    }
    searchWithQuery(searchTerm.trim(), { per_page: 20 });
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    searchWithQuery(suggestion, { per_page: 20 });
  };

  // 🔥 Sort repositories by difficulty level
  const sortedRepositories = useMemo(() => {
    const difficultyRank = { Beginner: 0, Intermediate: 1, Hardcore: 2 };
    return [...repositories].sort((a, b) => {
      const aRank = difficultyRank[a.difficulty?.level || 'Intermediate'];
      const bRank = difficultyRank[b.difficulty?.level || 'Intermediate'];
      return aRank - bRank;
    });
  }, [repositories]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Repositories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Search and discover GitHub repositories with our powerful search and filtering capabilities
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search repositories, topics, or describe what you're looking for..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length === 0);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchWithQuery()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />

              {/* Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested searches:</p>
                  </div>
                  {suggestedQueries.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm transition-colors duration-150"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            <button
              onClick={handleSearchWithQuery}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>Search</span>
            </button>

            <button
              onClick={refresh}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{totalCount.toLocaleString()}</span> repositories
            {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {loading && repositories.length === 0 ? (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto text-gray-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading repositories...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the latest data
            </p>
          </div>
        ) : sortedRepositories.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRepositories.map(repository => (
                <RepositoryCard key={repository.id} repository={repository} />
              ))}
            </div>

            {hasNextPage && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Load More</span>}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No repositories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Load Trending Repositories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
