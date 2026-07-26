const redis = require('../config/redis');
async function cacheMiddleware(req, res, next) {
  const key = `v4:${req.query.keyword || ''}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));
  next();
}
module.exports = cacheMiddleware;
