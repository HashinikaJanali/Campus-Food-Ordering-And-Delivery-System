import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentBadge = ({ aiAnalysis, sentiment }) => {
  if (!aiAnalysis) return null;

  const { confidence, emotions, topics, method } = aiAnalysis;

  // Sentiment configuration
  const getSentimentConfig = () => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          emoji: '😊',
          label: 'POSITIVE',
          color: 'from-green-400 to-emerald-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: TrendingUp
        };
      case 'negative':
        return {
          emoji: '😞',
          label: 'NEGATIVE',
          color: 'from-red-400 to-pink-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: TrendingDown
        };
      case 'neutral':
        return {
          emoji: '😐',
          label: 'NEUTRAL',
          color: 'from-yellow-400 to-orange-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Minus
        };
      default:
        return {
          emoji: '🤖',
          label: 'ANALYZING',
          color: 'from-gray-400 to-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Sparkles
        };
    }
  };

  const config = getSentimentConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 mt-4`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-bold text-purple-700">
          {method === 'ai-powered' ? 'AI ANALYSIS' : 'REVIEW ANALYSIS'}
        </span>
      </div>

      {/* Main Sentiment */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">{config.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.textColor}`} />
            <span className={`font-bold text-lg ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          {confidence && (
            <div className="text-sm text-gray-600 mt-1">
              {confidence}% confident
            </div>
          )}
        </div>
      </div>

      {/* Emotions */}
      {emotions && emotions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Emotions Detected:
          </div>
          <div className="flex flex-wrap gap-2">
            {emotions.slice(0, 3).map((emotion, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
              >
                {emotion.emotion} ({emotion.confidence}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Key Topics:
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {topic.topic} ({topic.confidence}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SentimentBadge;