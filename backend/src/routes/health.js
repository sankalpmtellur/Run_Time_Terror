const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'ai-backend' });
});

module.exports = { healthRouter: router };
