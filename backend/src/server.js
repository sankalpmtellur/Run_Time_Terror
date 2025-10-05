const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config({ path: process.cwd() + '/.env' });

const { searchRouter } = require('./routes/search');
const { healthRouter } = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));

const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/search', searchRouter);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'AI Search Backend', endpoints: ['/api/health', '/api/search'] });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`AI backend listening on http://localhost:${PORT}`);
});
