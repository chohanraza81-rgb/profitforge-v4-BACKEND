// backend/src/services/dataProviders/googleShopping.js
const axios = require('axios');
const { GOOGLE_SHOPPING_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Fetch product data from Google Shopping API.
 * @param {string} keyword - Search term.
 * @returns {object|null} - Product data or null if key missing/failed.
 */
async function fetch(keyword) {
  // If API key is not set, skip gracefully
  if (!GOOGLE_SHOPPING_API_KEY) {
    logger.warn('⚠️ GOOGLE_SHOPPING_API_KEY not set – skipping Google Shopping');
    return null;
  }

  try {
    // Google Shopping API endpoint (example – actual endpoint may vary)
    const url = `https://shopping.googleapis.com/v1/products:search?key=${GOOGLE_SHOPPING_API_KEY}&q=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, { timeout: 15000 });
    
    // Parse response (simplified)
    const products = response.data.products || [];
    const prices = products.map(p => parseFloat(p.price?.amount || 0)).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;

    return {
      products,
      avgPrice,
      source: 'GoogleShopping',
      updated: new Date().toISOString(),
      _latency: response.headers['x-response-time'] || null
    };
  } catch (err) {
    logger.error(`GoogleShopping error: ${err.message}`);
    return null;
  }
}

module.exports = { fetch };
