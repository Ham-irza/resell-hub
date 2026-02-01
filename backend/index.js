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

// --- DATABASE CONNECTION (Serverless-friendly) ---
// In Vercel serverless, mongoose.connect() is async but requests run immediately.
// Without awaiting, queries buffer and time out. This middleware ensures we're
// connected before any route handler runs. Connection is cached across warm invocations.
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }
  return mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  }).then(() => {
    console.log('✅ MongoDB Connected');
    return mongoose.connection;
  });
};

// Ensure DB is connected before any API route runs
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

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