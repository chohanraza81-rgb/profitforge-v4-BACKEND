// All similar structure – fetch function that returns data or null.
// For brevity, I'll show one example (shopify.js):
const axios = require('axios');
const { SHOPIFY_API_KEY } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  try {
    // Example: use Shopify API to search products
    const url = `https://your-store.myshopify.com/admin/api/2023-01/products.json?title=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, { headers: { 'X-Shopify-Access-Token': SHOPIFY_API_KEY }, timeout: 15000 });
    const products = response.data.products || [];
    const prices = products.map(p => parseFloat(p.variants[0]?.price || 0)).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;
    return { products, avgPrice, source: 'Shopify', updated: new Date().toISOString() };
  } catch (err) {
    logger.error(`Shopify error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
