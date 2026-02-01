const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // The Wallet
  walletBalance: { type: Number, default: 0 }, // Available to withdraw
  
  // Affiliate System
  referralCode: { type: String, unique: true }, // Their unique code
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who invited them
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);