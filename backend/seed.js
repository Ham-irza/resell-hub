require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import ALL models so we can delete them
const Plan = require('./models/Plan');
const User = require('./models/User');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🔥 Connected to DB. PERTFORMING FULL WIPE...');

    // --- 1. CLEAR ALL DATA (The "Hard Reset") ---
    await User.deleteMany({});
    await Plan.deleteMany({});
    await Investment.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Database Cleared Completely');

    // --- 2. SEED PLANS ---
    const plans = [
      {
        name: "Starter",
        price: 50000,
        returnPercentage: 4,
        totalItems: 30,
        dailyMinSales: 1,
        dailyMaxSales: 1
      },
      {
        name: "Growth",
        price: 100000,
        returnPercentage: 4.5,
        totalItems: 35,
        dailyMinSales: 1,
        dailyMaxSales: 2
      },
      {
        name: "Premium",
        price: 200000,
        returnPercentage: 5,
        totalItems: 40,
        dailyMinSales: 1,
        dailyMaxSales: 2
      }
    ];

    await Plan.insertMany(plans);
    console.log('✅ Plans Created');

    // --- 3. CREATE ADMIN USER ---
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@resellhub.com',
      password: hashedPassword, // <--- FIXED: Using the HASHED password now
      phone: '0000000000',
      role: 'admin',
      walletBalance: 0,
      referralCode: 'ADMIN'
    });

    await adminUser.save();
    console.log('✅ Admin User Created');
    console.log('   Email: admin@resellhub.com');
    console.log('   Pass:  admin123');

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });