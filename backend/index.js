const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startSimulation = require('./utils/simulationScheduler');

const app = express();

app.use(express.json());
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- DATABASE CONNECTION ---
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
};

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin/plans', require('./routes/admin-plans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/products', require('./routes/products'));
app.use('/api/store', require('./routes/store'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/plans', require('./routes/plans'));

// --- SERVE FRONTEND (FIXED PATH & ROUTE) ---

// 1. Serve static files from "dist/spa"
app.use(express.static(path.join(__dirname, '../dist/spa')));

// 2. Handle Frontend Routing - ONLY for non-API routes
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Start the auto-sell simulation scheduler
    startSimulation();
    console.log('📦 Auto-sell scheduler started');
});

module.exports = app;