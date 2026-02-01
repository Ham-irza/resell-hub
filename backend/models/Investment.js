const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  
  // Money Tracking
  investedAmount: { type: Number, required: true },
  expectedProfit: { type: Number, required: true }, // Calculated at start
  accumulatedReturn: { type: Number, default: 0 }, // Updates daily
  
  // Inventory Simulation
  totalStock: { type: Number, required: true },
  itemsSold: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investment', InvestmentSchema);