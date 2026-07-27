// backend/src/services/dataProviders/ebay.js
const axios = require('axios');
const { EBAY_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Fetch product data from eBay API.
 * @param {string} keyword - Search term.
 * @returns {object|null} - Product data or null if key missing/failed.
 */
async function fetch(keyword) {
  if (!EBAY_API_KEY) {
    logger.warn('⚠️ EBAY_API_KEY not set – skipping eBay');
    return null;
  }

  try {
    // eBay API endpoint (using Browse API)
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${EBAY_API_KEY}`, // Usually OAuth token, but simplified
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const items = response.data.itemSummaries || [];
    const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;

    return {
      items,
      avgPrice,
      source: 'eBay',
      updated: new Date().toISOString(),
      _latency: null
    };
  } catch (err) {
    logger.error(`eBay error: ${err.message}`);
    return null;
  }
}

module.exports = { fetch };
