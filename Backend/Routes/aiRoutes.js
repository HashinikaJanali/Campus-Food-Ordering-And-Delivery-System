// routes/aiRoutes.js (create this file)

const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

// Real-time AI analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Text must be at least 10 characters' 
      });
    }

    const analysis = await AIService.analyzeReview(text);
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

module.exports = router;