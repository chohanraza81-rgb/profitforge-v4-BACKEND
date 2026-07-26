const axios = require('axios');
const { SCRAPINGBEE_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  try {
    // Mock supplier prices
    return {
      aliExpress: { price: 12.99, shipping: 4.99 },
      '1688': { price: 8.50, shipping: 6.00 },
      shopify: { price: 15.00, shipping: 0 },
      amazon: { price: 19.99, shipping: 0 },
      source: 'ScrapingBee',
      updated: new Date().toISOString()
    };
  } catch (err) {
    logger.error(`ScrapingBee error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
