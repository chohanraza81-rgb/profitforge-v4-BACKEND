const axios = require('axios');
const { AMAZON_SCRAPER_KEY } = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Fetch Amazon product data using omkarcloud/amazon-scraper API
 * @param {string} keyword - Search term
 * @returns {object|null} - Product data or null if key missing/failed
 */
async function fetch(keyword) {
  if (!AMAZON_SCRAPER_KEY) {
    logger.warn('⚠️ AMAZON_SCRAPER_KEY missing – skipping Amazon scraper');
    return null;
  }

  try {
    const url = `https://api.omkarcloud.com/amazon-scraper?api_key=${AMAZON_SCRAPER_KEY}&keyword=${encodeURIComponent(keyword)}&country=us`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const products = response.data.products || [];
    
    // Extract product details
    const extractedProducts = products.map(p => ({
      title: p.title || 'Product',
      price: parseFloat(p.price?.value || p.price || 0),
      rating: parseFloat(p.rating || 0),
      reviews: parseInt(p.reviews || 0),
      image: p.image || null
    }));

    const prices = extractedProducts.map(p => p.price).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;

    return {
      products: extractedProducts,
      avgPrice,
      count: extractedProducts.length,
      source: 'omkarcloud/amazon-scraper',
      updated: new Date().toISOString(),
      _latency: response.headers['x-response-time'] || null
    };
  } catch (err) {
    logger.error(`Amazon Scraper error: ${err.message}`);
    return null;
  }
}

module.exports = { fetch };
