const express = require('express');
const router = express.Router();
const orchestrator = require('../../services/orchestrator');
const cacheMiddleware = require('../../middlewares/cache');

router.get('/', cacheMiddleware, async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });
  try {
    const result = await orchestrator.analyze(keyword, req.userId || 'anonymous');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
