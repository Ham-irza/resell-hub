require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// REMOVED: const startSimulation = require('./utils/simulationScheduler'); 

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

// --- ROUTES ---
app.get('/', (req, res) => res.send('ResellHub API Running')); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments')); // The new logic is in here
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/products', require('./routes/products'));
app.use('/api/store', require('./routes/store'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/payment', require('./routes/payment')); // Alfa Payment Gateway

// --- EXPORT FOR VERCEL ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;