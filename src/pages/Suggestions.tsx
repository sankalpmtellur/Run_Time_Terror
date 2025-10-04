import { useState } from 'react';
import { Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { mockProjects } from '../data/mockProjects';
import ProjectCard from '../components/ProjectCard';

const skillOptions = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Swift', 'Go'];
const interestOptions = ['Web Development', 'Mobile Apps', 'CLI Tools', 'Data Science', 'DevOps', 'UI/UX'];
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];

export default function Suggestions() {
  const [step, setStep] = useState<'preferences' | 'results'>('preferences');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const getRecommendations = () => {
    return mockProjects
      .filter(project => {
        const matchesSkill = selectedSkills.length === 0 || selectedSkills.includes(project.language);
        const matchesExperience =
          experience === 'Beginner' ? project.goodFirstIssues >= 5 :
          experience === 'Intermediate' ? project.communityScore >= 85 :
          true;
        return matchesSkill && matchesExperience;
      })
      .slice(0, 6);
  };

  const handleSubmit = () => {
    if (selectedSkills.length > 0 && selectedInterests.length > 0 && experience) {
      setStep('results');
    }
  };

  const reset = () => {
    setStep('preferences');
    setSelectedSkills([]);
    setSelectedInterests([]);
    setExperience('');
  };

  if (step === 'results') {
    const recommendations = getRecommendations();

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Personalized for You</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Your Recommended Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Based on your skills in <span className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedSkills.join(', ')}
              </span> and {experience.toLowerCase()} experience level
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Discover Again</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get Personalized Suggestions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tell us about yourself and we'll recommend the perfect projects
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What are your skills?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What interests you?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedInterests.includes(interest)
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-cyan-400 dark:hover:border-cyan-500'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's your experience level?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {experienceOptions.map(exp => (
                <button
                  key={exp}
                  onClick={() => setExperience(exp)}
                  className={`px-6 py-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                    experience === exp
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedSkills.length === 0 || selectedInterests.length === 0 || !experience}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              selectedSkills.length > 0 && selectedInterests.length > 0 && experience
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-[1.02]'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Get My Recommendations</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
