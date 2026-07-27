const express = require('express');
const router = express.Router();
router.get('/auth', (req, res) => res.json({ message: 'Sheets auth' }));
router.get('/callback', (req, res) => res.json({ message: 'Sheets callback' }));
router.post('/export', (req, res) => res.json({ message: 'Sheets export' }));
module.exports = router;
