const axios = require('axios');

// Hugging Face API configuration
const HF_API_KEY = process.env.HF_API_KEY || 'hf_temp';
const HF_API_URL = 'https://api-inference.huggingface.co/models/';

// UPDATED WORKING MODELS - 2024
const SENTIMENT_MODEL = 'distilbert-base-uncased-finetuned-sst-2-english';
const EMOTION_MODEL = 'bhadresh-savani/distilbert-base-uncased-emotion';
const TOPIC_MODEL = 'facebook/bart-large-mnli';

class AIService {
  
  // Analyze sentiment using AI
  async analyzeSentiment(text) {
    try {
      const response = await axios.post(
        `${HF_API_URL}${SENTIMENT_MODEL}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const results = response.data[0];
      const topSentiment = results.reduce((max, item) => 
        item.score > max.score ? item : max
      );

      let sentiment = 'neutral';
      const label = topSentiment.label.toLowerCase();
      
      if (label.includes('positive') || label === 'positive') {
        sentiment = 'positive';
      } else if (label.includes('negative') || label === 'negative') {
        sentiment = 'negative';
      }

      return {
        sentiment,
        confidence: (topSentiment.score * 100).toFixed(1),
        allScores: results.map(r => ({
          label: r.label,
          score: (r.score * 100).toFixed(1)
        }))
      };
    } catch (error) {
      console.error('❌ Sentiment API error:', error.response?.status, error.message);
      return this.fallbackSentiment(text);
    }
  }

  // Detect emotions using AI
  async detectEmotions(text) {
    try {
      const response = await axios.post(
        `${HF_API_URL}${EMOTION_MODEL}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const emotions = response.data[0];
      
      const topEmotions = emotions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(e => ({
          emotion: e.label,
          confidence: (e.score * 100).toFixed(1)
        }));

      return topEmotions;
    } catch (error) {
      console.error('❌ Emotion API error:', error.response?.status, error.message);
      return [{ emotion: 'neutral', confidence: '50.0' }];
    }
  }

  // Extract topics from review
  async extractTopics(text) {
    try {
      const topics = [
        'food quality',
        'delivery speed', 
        'price and value',
        'customer service',
        'packaging quality',
        'portion size',
        'taste and flavor',
        'freshness'
      ];

      const response = await axios.post(
        `${HF_API_URL}${TOPIC_MODEL}`,
        {
          inputs: text,
          parameters: {
            candidate_labels: topics,
            multi_label: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const detectedTopics = response.data.labels
        .map((label, index) => ({
          topic: label,
          confidence: (response.data.scores[index] * 100).toFixed(1)
        }))
        .filter(t => parseFloat(t.confidence) > 25)
        .slice(0, 3);

      return detectedTopics;
    } catch (error) {
      console.error('❌ Topic API error:', error.response?.status, error.message);
      return this.fallbackTopics(text);
    }
  }

  // Fallback sentiment analysis (rule-based)
  fallbackSentiment(text) {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'delicious', 'perfect', 
      'love', 'best', 'awesome', 'fantastic', 'wonderful', 'tasty', 
      'fresh', 'hot', 'fast', 'quick', 'friendly', 'nice', 'super',
      'brilliant', 'outstanding', 'incredible', 'fabulous', 'superb'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 
      'hate', 'poor', 'disappointing', 'cold', 'late', 'slow', 'rude', 
      'stale', 'burnt', 'soggy', 'nasty', 'gross', 'unacceptable',
      'pathetic', 'useless', 'trash', 'garbage'
    ];

    const lowerText = text.toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });

    let sentiment = 'neutral';
    let confidence = 50;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(60 + (positiveCount * 8), 95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(60 + (negativeCount * 8), 95);
    }

    console.log(`📊 Fallback sentiment: ${sentiment} (${positiveCount} positive, ${negativeCount} negative words)`);

    return {
      sentiment,
      confidence: confidence.toFixed(1),
      method: 'rule-based'
    };
  }

  // Fallback topics (rule-based)
  fallbackTopics(text) {
    const lowerText = text.toLowerCase();
    const topics = [];

    const topicKeywords = {
      'food quality': ['delicious', 'tasty', 'fresh', 'quality', 'flavor', 'taste', 'yummy', 'food'],
      'delivery speed': ['fast', 'quick', 'slow', 'late', 'delivery', 'arrived', 'time', 'wait'],
      'price and value': ['expensive', 'cheap', 'price', 'cost', 'value', 'worth', 'money'],
      'customer service': ['service', 'staff', 'friendly', 'rude', 'polite', 'helpful'],
      'packaging quality': ['packaging', 'wrapped', 'container', 'box', 'bag', 'sealed'],
      'portion size': ['portion', 'size', 'amount', 'quantity', 'small', 'large', 'big']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) count++;
      });
      if (count > 0) {
        topics.push({
          topic,
          confidence: Math.min(40 + (count * 15), 90).toFixed(1)
        });
      }
    });

    return topics.sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence)).slice(0, 3);
  }

  // Complete AI analysis
  async analyzeReview(reviewText) {
    if (!reviewText || reviewText.trim().length < 10) {
      return {
        sentiment: 'neutral',
        confidence: '50.0',
        emotions: [],
        topics: [],
        method: 'insufficient-text'
      };
    }

    console.log('🤖 Starting AI analysis...');

    try {
      // Run all analyses in parallel with individual error handling
      const [sentimentResult, emotions, topics] = await Promise.allSettled([
        this.analyzeSentiment(reviewText),
        this.detectEmotions(reviewText),
        this.extractTopics(reviewText)
      ]);

      // Extract results or use fallbacks
      const sentiment = sentimentResult.status === 'fulfilled' 
        ? sentimentResult.value 
        : this.fallbackSentiment(reviewText);

      const emotionData = emotions.status === 'fulfilled' 
        ? emotions.value 
        : [{ emotion: 'neutral', confidence: '50.0' }];

      const topicData = topics.status === 'fulfilled' 
        ? topics.value 
        : this.fallbackTopics(reviewText);

      const isAIPowered = sentimentResult.status === 'fulfilled' || 
                         emotions.status === 'fulfilled' || 
                         topics.status === 'fulfilled';

      console.log('✅ Analysis complete:', {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        emotionCount: emotionData.length,
        topicCount: topicData.length,
        method: isAIPowered ? 'ai-powered' : 'rule-based'
      });

      return {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        emotions: emotionData,
        topics: topicData,
        method: isAIPowered ? 'ai-powered' : 'rule-based',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Complete AI analysis failed:', error.message);
      // Full fallback
      const fallbackSentiment = this.fallbackSentiment(reviewText);
      const fallbackTopics = this.fallbackTopics(reviewText);
      
      return {
        ...fallbackSentiment,
        emotions: [{ emotion: 'neutral', confidence: '50.0' }],
        topics: fallbackTopics,
        method: 'rule-based'
      };
    }
  }

  // Generate vendor insights
  async generateVendorInsights(reviews) {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        summary: 'No reviews yet',
        strengths: [],
        improvements: [],
        overallSentiment: 'neutral'
      };
    }

    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length,
    };

    const positivePercentage = ((sentimentCounts.positive / totalReviews) * 100).toFixed(0);

    const allTopics = {};
    reviews.forEach(review => {
      if (review.aiAnalysis && review.aiAnalysis.topics) {
        review.aiAnalysis.topics.forEach(topic => {
          allTopics[topic.topic] = (allTopics[topic.topic] || 0) + 1;
        });
      }
    });

    const topTopics = Object.entries(allTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      summary: `${positivePercentage}% of customers are satisfied. ${totalReviews} total reviews analyzed.`,
      strengths: topTopics.filter(t => 
        reviews.some(r => r.rating >= 4 && r.aiAnalysis?.topics?.some(rt => rt.topic === t))
      ).slice(0, 2),
      improvements: topTopics.filter(t => 
        reviews.some(r => r.rating <= 2 && r.aiAnalysis?.topics?.some(rt => rt.topic === t))
      ).slice(0, 2),
      overallSentiment: sentimentCounts.positive > sentimentCounts.negative ? 'positive' : 
                       sentimentCounts.negative > sentimentCounts.positive ? 'negative' : 'neutral',
      sentimentBreakdown: sentimentCounts,
    };
  }
}

module.exports = new AIService();