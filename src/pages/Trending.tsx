import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { useRepositories } from '../hooks/useRepositories';
import RepositoryCard from '../components/RepositoryCard';

export default function Trending() {
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [timeRange, setTimeRange] = useState('daily');

  const {
    repositories,
    loading,
    error,
    totalCount,
    searchRepositories,
    refresh,
  } = useRepositories();

  const languages = [
    'all', 'javascript', 'typescript', 'python', 'java', 'c#', 'php', 'c++', 'c', 'go', 
    'rust', 'swift', 'kotlin', 'ruby', 'scala', 'html', 'css', 'shell', 'powershell', 'r'
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

  const timeRanges = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' }
  ];

  const loadTrending = () => {
    const params = {
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      domain: selectedDomain !== 'all' ? selectedDomain : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      since: timeRange,
      per_page: 30,
    };

    searchRepositories(params);
  };

  useEffect(() => {
    loadTrending();
  }, [selectedLanguage, selectedDomain, selectedDifficulty, timeRange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Trending Repositories
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover the most popular and trending open-source projects
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{totalCount.toLocaleString()}</span> trending repositories
          </p>
          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {loading && repositories.length === 0 ? (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto text-gray-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading trending repositories...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the latest trending data
            </p>
          </div>
        ) : repositories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map(repository => (
              <RepositoryCard key={repository.id} repository={repository} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No trending repositories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
