// backend/src/services/dataProviders/etsy.js
const axios = require('axios');
const { ETSY_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Fetch product data from Etsy API.
 * @param {string} keyword - Search term.
 * @returns {object|null} - Product data or null if key missing/failed.
 */
async function fetch(keyword) {
  if (!ETSY_API_KEY) {
    logger.warn('⚠️ ETSY_API_KEY not set – skipping Etsy');
    return null;
  }

  try {
    // Etsy API endpoint (v3)
    const url = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keyword)}&limit=10`;
    const response = await axios.get(url, {
      headers: {
        'x-api-key': ETSY_API_KEY,  // Etsy uses x-api-key header
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const listings = response.data.results || [];
    const prices = listings.map(l => parseFloat(l.price?.amount || 0)).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;

    return {
      listings,
      avgPrice,
      source: 'Etsy',
      updated: new Date().toISOString(),
      _latency: null
    };
  } catch (err) {
    logger.error(`Etsy error: ${err.message}`);
    return null;
  }
}

module.exports = { fetch };
