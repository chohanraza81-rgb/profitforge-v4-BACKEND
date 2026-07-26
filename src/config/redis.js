const Redis = require('ioredis');
const { REDIS_URL } = require('./env');
const logger = require('./logger');

const client = new Redis(REDIS_URL);
client.on('error', (err) => logger.error(`Redis error: ${err}`));
client.on('connect', () => logger.info('✅ Redis connected'));

module.exports = client;
