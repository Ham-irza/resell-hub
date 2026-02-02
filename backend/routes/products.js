const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware'); // Ensure you have this middleware
const Product = require('../models/Product');

// @route   GET api/products
// @desc    Get all products (Visible to all logged in users)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products
// @desc    Create a product (Admin Only)
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
  // Destructure image from body
  const { name, price, quantity, description, image } = req.body; 
  try {
    const newProduct = new Product({
      name,
      price,
      quantity,
      description,
      image // Save it
    });
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product (Admin Only)
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    await product.deleteOne();
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;