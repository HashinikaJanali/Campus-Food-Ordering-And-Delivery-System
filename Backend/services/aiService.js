const axios = require('axios');

// Hugging Face API configuration
const HF_API_KEY = process.env.HF_API_KEY || 'hf_temp';
const HF_API_URL = 'https://api-inference.huggingface.co/models/';

// Sentiment Analysis Model
const SENTIMENT_MODEL = 'cardiffnlp/twitter-roberta-base-sentiment-latest';

// Emotion Detection Model
const EMOTION_MODEL = 'j-hartmann/emotion-english-distilroberta-base';

// Zero-shot Classification for Topics
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
          timeout: 30000, // 30 second timeout
        }
      );

      const results = response.data[0];
      
      // Find highest confidence sentiment
      const topSentiment = results.reduce((max, item) => 
        item.score > max.score ? item : max
      );

      // Map labels to our format
      let sentiment = 'neutral';
      if (topSentiment.label.includes('positive')) sentiment = 'positive';
      if (topSentiment.label.includes('negative')) sentiment = 'negative';

      return {
        sentiment,
        confidence: (topSentiment.score * 100).toFixed(1),
        allScores: results.map(r => ({
          label: r.label,
          score: (r.score * 100).toFixed(1)
        }))
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error.message);
      // Fallback to rule-based
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
      
      // Get top 3 emotions
      const topEmotions = emotions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(e => ({
          emotion: e.label,
          confidence: (e.score * 100).toFixed(1)
        }));

      return topEmotions;
    } catch (error) {
      console.error('Emotion detection error:', error.message);
      return [{ emotion: 'neutral', confidence: '50.0' }];
    }
  }

  // Extract topics from review
  async extractTopics(text) {
    try {
      const topics = [
        'food quality',
        'delivery speed',
        'price value',
        'customer service',
        'packaging',
        'portion size'
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

      // Get topics with confidence > 30%
      const detectedTopics = response.data.labels
        .map((label, index) => ({
          topic: label,
          confidence: (response.data.scores[index] * 100).toFixed(1)
        }))
        .filter(t => parseFloat(t.confidence) > 30)
        .slice(0, 3);

      return detectedTopics;
    } catch (error) {
      console.error('Topic extraction error:', error.message);
      return [];
    }
  }

  // Generate AI insights for a vendor
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

    // Count sentiments
    const sentimentCounts = {
      positive: reviews.filter(r => r.aiAnalysis?.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.aiAnalysis?.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.aiAnalysis?.sentiment === 'negative').length,
    };

    // Find most common topics
    const allTopics = reviews
      .flatMap(r => r.aiAnalysis?.topics || [])
      .reduce((acc, topic) => {
        acc[topic.topic] = (acc[topic.topic] || 0) + 1;
        return acc;
      }, {});

    const topTopics = Object.entries(allTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Overall sentiment
    const overallSentiment = sentimentCounts.positive > sentimentCounts.negative 
      ? 'positive' 
      : sentimentCounts.negative > sentimentCounts.positive 
      ? 'negative' 
      : 'neutral';

    // Generate insights
    const positivePercentage = ((sentimentCounts.positive / totalReviews) * 100).toFixed(0);

    return {
      summary: `${positivePercentage}% of customers are satisfied. ${totalReviews} total reviews analyzed.`,
      strengths: topTopics.filter(t => 
        reviews.some(r => 
          r.aiAnalysis?.topics?.some(rt => 
            rt.topic === t && r.rating >= 4
          )
        )
      ),
      improvements: topTopics.filter(t => 
        reviews.some(r => 
          r.aiAnalysis?.topics?.some(rt => 
            rt.topic === t && r.rating <= 2
          )
        )
      ),
      overallSentiment,
      sentimentBreakdown: {
        positive: sentimentCounts.positive,
        neutral: sentimentCounts.neutral,
        negative: sentimentCounts.negative,
      }
    };
  }

  // Fallback sentiment analysis (rule-based)
  fallbackSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'delicious', 'perfect', 'love', 'best', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'hate', 'poor', 'disappointing', 'cold'];

    const lowerText = text.toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    let sentiment = 'neutral';
    let confidence = 50;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(50 + (positiveCount * 10), 95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(50 + (negativeCount * 10), 95);
    }

    return {
      sentiment,
      confidence: confidence.toFixed(1),
      method: 'rule-based'
    };
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

    try {
      // Run all analyses in parallel
      const [sentimentResult, emotions, topics] = await Promise.all([
        this.analyzeSentiment(reviewText),
        this.detectEmotions(reviewText),
        this.extractTopics(reviewText)
      ]);

      return {
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        emotions,
        topics,
        method: 'ai-powered',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Full AI analysis error:', error);
      return {
        ...this.fallbackSentiment(reviewText),
        emotions: [],
        topics: [],
        method: 'fallback'
      };
    }
  }
}

module.exports = new AIService();