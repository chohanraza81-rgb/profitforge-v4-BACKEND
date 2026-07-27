const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');

// Google Sheets OAuth and export endpoints
router.get('/auth', auth, (req, res) => {
  // Redirect to Google OAuth
  res.json({ message: 'Google Sheets OAuth flow' });
});

router.get('/callback', (req, res) => {
  // OAuth callback
  res.json({ message: 'OAuth callback received' });
});

router.post('/export', auth, async (req, res) => {
  // Export data to Google Sheets
  res.json({ message: 'Export to Sheets' });
});

module.exports = router;
