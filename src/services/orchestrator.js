const redis = require('../config/redis');
const logger = require('../config/logger');
const providers = require('./dataProviders');
const scoringEngine = require('./scoringEngine');
const pricingEngine = require('./pricingEngine');
const forecasting = require('./forecastingService');

const CACHE_TTL = 86400; // 24h
const STALE_TTL = 604800; // 7d

class Orchestrator {
  async analyze(keyword, userId = 'anonymous') {
    const cacheKey = `v4:${keyword}:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      this.refreshBackground(keyword, userId, cacheKey);
      return JSON.parse(cached);
    }

    const start = Date.now();
    const providerNames = Object.keys(providers);
    const promises = providerNames.map(name => providers[name].fetch(keyword));
    const settled = await Promise.allSettled(promises);

    const rawData = {};
    providerNames.forEach((name, idx) => {
      rawData[name] = settled[idx].status === 'fulfilled' ? settled[idx].value : null;
    });

    const scores = await scoringEngine.calculate(rawData);
    const pricing = await pricingEngine.recommend(rawData, scores);
    const forecast = await forecasting.predict(rawData);

    const result = {
      keyword,
      userId,
      timestamp: new Date().toISOString(),
      latency: Date.now() - start,
      sources: providerNames.map((name, idx) => ({
        provider: name,
        status: settled[idx].status,
        latency: settled[idx].status === 'fulfilled' ? settled[idx].value._latency || null : null
      })),
      raw: rawData,
      scores,
      pricing,
      forecast,
      confidence: scores.confidence
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    await redis.setex(`${cacheKey}:stale`, STALE_TTL, JSON.stringify(result));
    return result;
  }

  async refreshBackground(keyword, userId, cacheKey) {
    setImmediate(async () => {
      try {
        await this.analyze(keyword, userId);
        logger.info(`Background refresh for ${keyword} completed`);
      } catch (err) {
        logger.error(`Background refresh failed: ${err.message}`);
      }
    });
  }
}
module.exports = new Orchestrator();
