import { Star, GitFork, AlertCircle, ExternalLink, Calendar, Code, Users } from 'lucide-react';
import { Repository } from '../services/api';

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  // Derive fallback difficulty if backend did not provide one
  const deriveFallbackDifficulty = () => {
    const stars = repository.stargazers_count || 0;
    const forks = repository.forks_count || 0;
    const issues = repository.open_issues_count || 0;
    const size = (repository as any).size || 0;
    const engagement = stars + forks;
    let score = 0;
    // Size
    if (size < 1000) score += 20; else if (size < 10000) score += 12; else if (size < 50000) score += 6;
    // Popularity (lower engagement => easier to contribute)
    if (engagement < 10) score += 20; else if (engagement < 100) score += 12; else if (engagement < 1000) score += 6;
    // Issue ratio
    const issueRatio = issues / Math.max(stars, 1);
    if (issueRatio < 0.01) score += 15; else if (issueRatio < 0.05) score += 10; else if (issueRatio < 0.1) score += 5;
    // Language gentle boost
    const beginnerLangs = ['html', 'css', 'javascript', 'typescript', 'python', 'ruby', 'php'];
    const lang = (repository.language || '').toLowerCase();
    if (beginnerLangs.includes(lang)) score += 8;
    let level: 'Beginner' | 'Intermediate' | 'Hardcore' = 'Intermediate';
    if (score >= 65) level = 'Beginner'; else if (score < 35) level = 'Hardcore';
    return {
      level,
      score: Math.min(100, Math.max(0, score)),
      description: 'Estimated difficulty',
      color: '#9ca3af',
      factors: [] as Array<{ name: string; weight: number; value: string }>,
      recommendations: [] as string[],
    };
  };

  const safeDifficulty = repository.difficulty || deriveFallbackDifficulty();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hardcore':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
                className="w-8 h-8 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {repository.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {repository.owner.login}
                </p>
              </div>
            </div>
            
            {repository.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {repository.description}
              </p>
            )}
          </div>
          
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Difficulty Badge */
        }
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(safeDifficulty.level)}`}>
              {safeDifficulty.level}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {safeDifficulty.score}/100
            </span>
          </div>
          
          {repository.has_good_first_issues && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
              Good First Issues
            </span>
          )}
        </div>

        {/* Topics */}
        {repository.topics && repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {repository.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {topic}
              </span>
            ))}
            {repository.topics.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                +{repository.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4" />
            <span>{repository.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <GitFork className="w-4 h-4" />
            <span>{repository.forks_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>{repository.open_issues_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Code className="w-4 h-4" />
            <span>{repository.language || 'Unknown'}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(repository.updated_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{repository.visibility}</span>
          </div>
        </div>
      </div>

      {/* Footer with Recommendations */}
      {safeDifficulty.recommendations && safeDifficulty.recommendations.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            <strong>Recommendations:</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {safeDifficulty.recommendations[0]}
          </p>
        </div>
      )}
    </div>
  );
}
