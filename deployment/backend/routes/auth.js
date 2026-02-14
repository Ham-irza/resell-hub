const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');
const auth = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register user & Handle Referral
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, phone, referralCode, store } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create User Object
    user = new User({
      name,
      email,
      password,
      phone,
      // Selected store (will be validated below)
      store: null,
      // Generate unique referral code (e.g., name-1234)
      referralCode: `${name.replace(/\s/g, '').toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    // 3. Handle Referral Logic
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
      }
    }

    // 4. Handle store selection if provided (validate against Store collection)
    if (store) {
      // allow special value 'none' or validate ObjectId
      if (store === 'none') {
        user.store = null;
      } else {
        const s = await Store.findById(store);
        if (!s) {
          return res.status(400).json({ msg: 'Selected store is invalid' });
        }
        user.store = s._id;
      }
    }

    // 5. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 6. Save to DB
    await user.save();

    // 7. Return JWT Token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check User
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Return Token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/logout
// @desc    Logout user (Stateless - Client should delete token)
// @access  Public
router.post('/logout', (req, res) => {
  // Since JWT is stateless, the backend doesn't need to do much.
  // The Client must remove 'token' from localStorage.
  // We just send a success message.
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;