const express = require('express');
const router = express.Router();
const exportService = require('../../services/exportService');
const fs = require('fs');
const path = require('path');
const { auth } = require('../../middlewares/auth');

router.post('/:format', auth, async (req, res) => {
  const { format } = req.params;
  const data = req.body;
  const outputDir = path.join(__dirname, '../../../tmp');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filePath = path.join(outputDir, `report.${format}`);
  const validFormats = ['pdf','docx','csv','json','html','markdown','pptx'];
  if (!validFormats.includes(format)) return res.status(400).json({ error: 'Invalid format' });

  const generator = exportService[`generate${format.toUpperCase()}`];
  if (!generator) return res.status(400).json({ error: 'Format not supported' });
  await generator(data, filePath);
  res.download(filePath, `profitforge-report.${format}`, () => fs.unlinkSync(filePath));
});

// Notion
router.post('/notion', auth, async (req, res) => {
  const { data, pageId } = req.body;
  const result = await exportService.generateNotion(data, pageId);
  res.json({ success: true, pageId: result.id });
});

// Google Sheets (requires OAuth)
router.post('/sheets', auth, async (req, res) => {
  const { data, authClient } = req.body;
  const spreadsheetId = await exportService.generateGoogleSheets(data, authClient);
  res.json({ success: true, spreadsheetId });
});
module.exports = router;
