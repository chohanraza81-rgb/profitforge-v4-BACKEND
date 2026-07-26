const express = require('express');
const router = express.Router();
const Alert = require('../../models/Alert');
const emailService = require('../../services/emailService');
const { auth } = require('../../middlewares/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const alerts = await Alert.find({ userId: req.userId });
  res.json(alerts);
});

router.post('/', async (req, res) => {
  const { keyword, conditions, frequency } = req.body;
  const alert = await Alert.create({ userId: req.userId, keyword, conditions, frequency });
  res.status(201).json(alert);
});

// Cron job endpoint (can be called by external scheduler)
router.post('/send', async (req, res) => {
  // Find all alerts, fetch data, and send emails
  // Simplified:
  const alerts = await Alert.find({});
  for (const alert of alerts) {
    const orchestrator = require('../../services/orchestrator');
    const data = await orchestrator.analyze(alert.keyword, alert.userId);
    await emailService.sendDailyReport(alert.userId, data);
  }
  res.json({ sent: alerts.length });
});
module.exports = router;
