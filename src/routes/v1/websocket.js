const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');

// This is just a placeholder – actual WebSocket is handled in server.js
router.get('/status', auth, (req, res) => {
  res.json({ status: 'WebSocket server running' });
});

module.exports = router;
