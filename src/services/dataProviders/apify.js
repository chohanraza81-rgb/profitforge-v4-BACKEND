const axios = require('axios');
const { APIFY_API_TOKEN } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  try {
    // In production, start a run and poll. For demo, mock.
    return {
      ads: [
        { title: `Ad 1 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 78 },
        { title: `Ad 2 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 65 },
        { title: `Ad 3 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 92 },
        { title: `Ad 4 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 44 },
        { title: `Ad 5 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 58 },
        { title: `Ad 6 for ${keyword}`, image: 'https://via.placeholder.com/300x300', engagement: 70 }
      ],
      source: 'Apify',
      updated: new Date().toISOString()
    };
  } catch (err) {
    logger.error(`Apify error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
