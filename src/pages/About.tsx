import { Target, Lightbulb, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About DiscoverOSS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Making open source discovery more fair, intelligent, and personalized
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200 dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              The Problem We're Solving
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              GitHub's search functionality is powerful, but it has a significant limitation: popular projects dominate search results.
              This makes it incredibly difficult for developers to discover hidden gems, newer projects, or repositories that might be
              a perfect fit for their specific needs and skill level.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Whether you're a beginner looking for your first contribution, an experienced developer seeking projects in a specific
              domain, or someone who wants to find actively maintained projects with welcoming communities, the traditional search
              experience often falls short.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Our Solution
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              DiscoverOSS is a discovery engine that goes beyond stars and forks. We help developers find the right open-source
              projects by providing:
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Advanced Filtering
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Filter projects by programming language, topics, commit recency, number of "good first issues",
              and community friendliness scores to find exactly what you're looking for.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Personalized Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get project suggestions tailored to your skills, interests, and experience level. Whether you're a
              beginner or expert, find projects that match your profile.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Community Focus
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We highlight projects with welcoming communities, active maintainers, and good documentation to ensure
              your contribution experience is positive and rewarding.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Fair Discovery
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We level the playing field by surfacing quality projects regardless of their star count, giving smaller
              and newer projects the visibility they deserve.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Built at Hackathon 2025
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            DiscoverOSS was created with a mission to improve the developer experience and make open source
            contribution more accessible to everyone. We believe that great projects shouldn't be hidden,
            and every developer should have the tools to find their perfect match in the open source world.
          </p>
        </div>
      </div>
    </div>
  );
}
