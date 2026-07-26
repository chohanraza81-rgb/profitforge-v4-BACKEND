const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const analyzeRoutes = require('./routes/v1/analyze');
const projectsRoutes = require('./routes/v1/projects');
const exportRoutes = require('./routes/v1/export');
const alertsRoutes = require('./routes/v1/alerts');
const authRoutes = require('./routes/v1/auth');
const sheetsRoutes = require('./routes/v1/sheets');
const websocketRoutes = require('./routes/v1/websocket');

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sheets', sheetsRoutes);
app.use('/api/v1/ws', websocketRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use(errorHandler);
module.exports = app;
