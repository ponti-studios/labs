const express = require('express');
const app = express();
const PORT = 3000;

// CORS middleware - allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware to parse JSON
app.use(express.json());

// GET endpoint to retrieve medication schedule
app.get('/api/medication-schedule', (_req, res) => {
  res.json({
    weeklyDosages: [25, 30, 20, 35],
    penCapacity: 100,
    description: 'Weekly medication dosages in mg'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medication API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Medication API server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/medication-schedule`);
});
