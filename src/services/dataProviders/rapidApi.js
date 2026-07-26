const axios = require('axios');
const { RAPIDAPI_KEY } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  try {
    // TikTok
    const tiktokOptions = {
      method: 'GET',
      url: 'https://tiktok-scraper7.p.rapidapi.com/feed/search',
      params: { keyword, count: 10 },
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com' },
      timeout: 15000
    };
    const tiktokRes = await axios.request(tiktokOptions);
    const totalViews = tiktokRes.data.data?.videos?.reduce((acc, v) => acc + (v.play_count || 0), 0) || 0;

    // Amazon
    const amazonOptions = {
      method: 'GET',
      url: 'https://amazon-price1.p.rapidapi.com/search',
      params: { q: keyword, country: 'US' },
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'amazon-price1.p.rapidapi.com' },
      timeout: 15000
    };
    const amazonRes = await axios.request(amazonOptions);
    const products = amazonRes.data.products || [];
    const prices = products.map(p => parseFloat(p.price)).filter(p => p > 0);
    const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0)/prices.length : 0;

    return { totalViews, amazonProducts: products, avgPrice, source: 'RapidAPI', updated: new Date().toISOString() };
  } catch (err) {
    logger.error(`RapidAPI error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
