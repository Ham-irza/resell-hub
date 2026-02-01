require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startSimulation = require('./utils/simulationScheduler'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "*", // Allow calls from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Database Connection
// Note: In serverless, we must ensure we don't open too many connections
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('✅ MongoDB Connected'))
      .catch(err => console.log('❌ DB Connection Error:', err));
}

// --- ROUTES ---
app.get('/', (req, res) => res.send('ResellHub API Running')); // Health Check
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// --- START THE SIMULATION ENGINE ---
// Note: On Vercel Serverless, this internal scheduler acts differently than a VPS.
// It will initialize when the function wakes up. 
startSimulation(); 
console.log('⏰ Simulation Engine initialized');

// --- VERCEL SERVER CONFIGURATION ---

// 1. Local Development (Runs continuously)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// 2. Production/Vercel (Exports the app for serverless handler)
module.exports = app;