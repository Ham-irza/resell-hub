const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Growth"
  price: { type: Number, required: true }, // e.g., 100000
  returnPercentage: { type: Number, required: true }, // e.g., 4.5
  totalItems: { type: Number, required: true }, // e.g., 35
  durationDays: { type: Number, default: 30 }, // Cycle length
  dailyMinSales: { type: Number, default: 1 },
  dailyMaxSales: { type: Number, default: 2 }
});

module.exports = mongoose.model('Plan', PlanSchema);