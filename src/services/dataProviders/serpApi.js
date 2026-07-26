const axios = require('axios');
const { SERPAPI_KEY } = require('../../config/env');
const logger = require('../../config/logger');

async function fetch(keyword) {
  try {
    const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(keyword)}&api_key=${SERPAPI_KEY}`;
    const response = await axios.get(url, { timeout: 15000 });
    const interestOverTime = response.data.interest_over_time?.timeline_data || [];
    const avgInterest = interestOverTime.reduce((acc, d) => acc + (d.values[0]?.extracted_value || 0), 0) / (interestOverTime.length || 1);
    return { interestOverTime, avgInterest, source: 'SerpAPI', updated: new Date().toISOString(), _latency: response.data._latency };
  } catch (err) {
    logger.error(`SerpAPI error: ${err.message}`);
    return null;
  }
}
module.exports = { fetch };
