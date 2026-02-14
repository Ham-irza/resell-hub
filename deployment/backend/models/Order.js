const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: { // Reference to the product just in case
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: { // Stored as string so it remains even if product is deleted
    type: String,
    required: true
  },
  productImage: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'cancelled'],
    default: 'processing' // Default to processing since payment "succeeded"
  },
  paymentMethod: {
    type: String,
    default: 'Bank Alfalah Gateway'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);