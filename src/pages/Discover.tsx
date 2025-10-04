import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useRepositories } from '../hooks/useRepositories';
import RepositoryCard from '../components/RepositoryCard';

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [hasGoodFirstIssues, setHasGoodFirstIssues] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    repositories,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    searchRepositories,
    loadMore,
    refresh,
  } = useRepositories();

  const languages = [
    'all', 'javascript', 'typescript', 'python', 'java', 'c#', 'php', 'c++', 'c', 'go', 
    'rust', 'swift', 'kotlin', 'ruby', 'scala', 'html', 'css', 'shell', 'powershell', 'r', 
    'dart', 'lua', 'perl', 'haskell', 'clojure', 'elixir', 'erlang', 'ocaml', 'f#', 'vb'
  ];

  const domains = [
    'all', 'web', 'mobile', 'desktop', 'backend', 'data', 'devops', 'game', 'blockchain', 
    'ai', 'ml', 'iot', 'security', 'testing', 'documentation', 'education', 'research'
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'hardcore', label: 'Hardcore' }
  ];

  const handleSearch = () => {
    const params = {
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      domain: selectedDomain !== 'all' ? selectedDomain : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      has_good_first_issues: hasGoodFirstIssues,
      sort: 'best-match',
      order: 'desc',
      per_page: 20,
    };

    searchRepositories(params);
  };

  const handleSearchWithQuery = () => {
    if (!searchTerm.trim()) {
      handleSearch();
      return;
    }

    // Use search endpoint for text queries
    const params = {
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      domain: selectedDomain !== 'all' ? selectedDomain : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      has_good_first_issues: hasGoodFirstIssues,
      sort: 'best-match',
      order: 'desc',
      per_page: 20,
    };

    // This would need to be implemented in the hook for search queries
    searchRepositories(params);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Repositories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find the perfect open-source project with our advanced AI-powered filtering
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search repositories or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchWithQuery()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleSearchWithQuery}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>Search</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>
                      {domain === 'all' ? 'All Domains' : domain.charAt(0).toUpperCase() + domain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="goodFirstIssues"
                  checked={hasGoodFirstIssues}
                  onChange={(e) => setHasGoodFirstIssues(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="goodFirstIssues" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Good First Issues
                </label>
              </div>
            </div>
          )}
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
        ) : repositories.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map(repository => (
                <RepositoryCard key={repository.id} repository={repository} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Load More</span>
                    </>
                  )}
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
              Load Popular Repositories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}