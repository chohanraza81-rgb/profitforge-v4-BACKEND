const axios = require('axios');
const { APIFY_API_TOKEN } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  if (!APIFY_API_TOKEN) {
    logger.warn('⚠️ APIFY_API_TOKEN missing – skipping Facebook Ads');
    return null;
  }
  try {
    // Real Apify API call – start a run and poll for results
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/maxcopell~facebook-ads-scraper/runs`,
      { keyword, maxResults: 6 },
      { headers: { Authorization: `Bearer ${APIFY_API_TOKEN}` }, timeout: 15000 }
    );
    const runId = runResponse.data.data.id;
    // Poll for status (simplified; in production, use webhook or retry)
    // For now, return null if no data yet – never mock.
    return null; // Placeholder; implement polling later.
  } catch (err) {
    logger.error(`Apify error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
