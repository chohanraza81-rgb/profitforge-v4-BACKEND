const axios = require('axios');
const { SCRAPINGBEE_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  if (!SCRAPINGBEE_API_KEY) {
    logger.warn('⚠️ SCRAPINGBEE_API_KEY missing – skipping supplier prices');
    return null;
  }
  try {
    // Real ScrapingBee call
    const url = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, { timeout: 15000 });
    // Parse response to extract prices
    // For now, return null if parsing fails – never mock.
    return null;
  } catch (err) {
    logger.error(`ScrapingBee error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
