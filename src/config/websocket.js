const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./env');

function initWebSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    socket.on('analyze', async (keyword) => {
      const orchestrator = require('../services/orchestrator');
      const result = await orchestrator.analyze(keyword, socket.userId);
      socket.emit('analysisResult', result);
    });
    socket.on('disconnect', () => console.log('User disconnected'));
  });
  return io;
}
module.exports = initWebSocket;
