const app = require('./app');
const http = require('http');
const { PORT } = require('./config/env');
const logger = require('./config/logger');
const initWebSocket = require('./config/websocket');

const server = http.createServer(app);
const io = initWebSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🔌 WebSocket ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
