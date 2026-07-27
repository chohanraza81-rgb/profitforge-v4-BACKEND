const axios = require('axios');
const { APIFY_API_TOKEN } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  if (!APIFY_API_TOKEN) {
    logger.warn('⚠️ APIFY_API_TOKEN missing – skipping Facebook Ads');
    return null;
  }

  try {
    // Start a run
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/maxcopell~facebook-ads-scraper/runs`,
      {
        keyword,
        maxResults: 6
      },
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_TOKEN}`,   // ✅ Must be "Bearer <token>"
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const runId = runResponse.data.data.id;

    // Poll for results (simplified – you may want to implement a proper polling loop)
    // For now, we'll return null until results are ready.
    // In production, poll the run status endpoint.
    return null; // Placeholder; replace with actual polling logic.

  } catch (err) {
    logger.error(`Apify error: ${err.message}`);
    return null;
  }
}

module.exports = { fetch };
