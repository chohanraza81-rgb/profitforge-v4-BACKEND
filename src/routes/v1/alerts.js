const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');
const emailService = require('../../services/emailService');
const orchestrator = require('../../services/orchestrator');
const Alert = require('../../models/Alert');
const logger = require('../../config/logger');

// Get all alerts for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.userId });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new alert
router.post('/', auth, async (req, res) => {
  try {
    const { keyword, conditions, frequency } = req.body;
    const alert = await Alert.create({
      userId: req.userId,
      keyword,
      conditions,
      frequency: frequency || 'daily'
    });
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an alert
router.delete('/:id', auth, async (req, res) => {
  try {
    await Alert.deleteOne({ _id: req.params.id, userId: req.userId });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual trigger for testing – sends alert for a specific keyword
router.post('/send', auth, async (req, res) => {
  try {
    const { keyword, email } = req.body;
    if (!keyword || !email) {
      return res.status(400).json({ error: 'keyword and email required' });
    }
    const data = await orchestrator.analyze(keyword, req.userId);
    const html = `<h1>PROFITFORGE Alert</h1><p>Keyword: ${keyword}</p><pre>${JSON.stringify(data.scores, null, 2)}</pre>`;
    await emailService.sendAlert(email, `Alert: ${keyword}`, html);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cron job endpoint (for external scheduler) – sends daily alerts for all users
router.post('/cron', async (req, res) => {
  try {
    const alerts = await Alert.find({});
    let sent = 0;
    for (const alert of alerts) {
      try {
        const data = await orchestrator.analyze(alert.keyword, alert.userId);
        const html = `<h1>Daily Alert</h1><p>${alert.keyword}</p><pre>${JSON.stringify(data.scores, null, 2)}</pre>`;
        await emailService.sendAlert(alert.userId, `Daily Alert: ${alert.keyword}`, html);
        sent++;
      } catch (err) {
        logger.error(`Failed to send alert for ${alert.keyword}: ${err.message}`);
      }
    }
    res.json({ sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
