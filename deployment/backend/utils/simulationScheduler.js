const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification'); 
const { sendPayoutEmail } = require('../utils/emailService'); // <--- ADDED IMPORT

const startSimulation = () => {
  // Schedule task to run every day at Midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 DAILY SIMULATION STARTED: Processing sales...');

    try {
      // 1. Find all investments that are currently 'active'
      // We populate 'plan' so we can get the plan name for the email
      const activeInvestments = await Investment.find({ status: 'active' }).populate('plan');

      if (activeInvestments.length === 0) {
        console.log('✅ No active investments to process.');
        return;
      }

      console.log(`Checking ${activeInvestments.length} active investments...`);

      // 2. Loop through each investment and simulate sales
      for (const inv of activeInvestments) {
        
        // --- LOGIC: Sell 1 or 2 items randomly ---
        const salesToday = Math.floor(Math.random() * 2) + 1; // Returns 1 or 2
        
        let newItemsSold = inv.itemsSold + salesToday;
        
        // Calculate the profit gained specifically from these items
        const profitPerItem = inv.expectedProfit / inv.totalStock;
        const profitGainedToday = profitPerItem * salesToday;

        // Update the tracked "Accumulated Return" (Virtual Profit)
        inv.accumulatedReturn += profitGainedToday;

        // --- CHECK: Is the cycle finished? ---
        if (newItemsSold >= inv.totalStock) {
          // Cap values to max (in case we sold 2 but only 1 was left)
          newItemsSold = inv.totalStock;
          inv.accumulatedReturn = inv.expectedProfit; // Ensure exact max profit is recorded
          
          // 1. Mark Investment as Completed
          inv.status = 'completed';
          inv.itemsSold = newItemsSold;
          inv.lastUpdated = Date.now();
          await inv.save();

          // 2. PAYOUT: Add Capital + Profit to User's Wallet
          const totalPayout = inv.investedAmount + inv.expectedProfit;
          
          const user = await User.findById(inv.user);
          if (user) {
            user.walletBalance += totalPayout;
            await user.save();
            
            // 3. Log the Payout Transaction
            await Transaction.create({
              user: user._id,
              type: 'profit_payout',
              amount: totalPayout,
              status: 'approved',
              description: `Cycle Completed: ${inv._id}`
            });

            // 4. NOTIFY USER (Dashboard Notification)
            await Notification.create({
              user: user._id,
              message: `🎉 Cycle Complete! All items sold. Payout of PKR ${totalPayout.toLocaleString()} added to wallet.`
            });
            
            // 5. SEND EMAIL NOTIFICATION (Payout)
            // Use plan name if available, otherwise fallback to "Investment Plan"
            const planName = inv.plan ? inv.plan.name : "Investment Plan";
            sendPayoutEmail(user.email, user.name, totalPayout, planName);

            console.log(`💰 PAYOUT: User ${user.name} received PKR ${totalPayout}`);
          }

        } else {
          // Cycle NOT finished, just update the progress
          inv.itemsSold = newItemsSold;
          inv.lastUpdated = Date.now();
          await inv.save();
          
          // 4. NOTIFY USER (Daily Sales Dashboard Notification)
          await Notification.create({
            user: inv.user,
            message: `📦 You sold ${salesToday} item(s) today! Profit: PKR ${Math.round(profitGainedToday)}`
          });

          console.log(`📈 UPDATE: Investment ${inv._id} sold ${salesToday} items.`);
        }
      }
      
      console.log('✅ Daily simulation finished successfully.');

    } catch (error) {
      console.error('❌ SIMULATION ERROR:', error);
    }
  });
};

module.exports = startSimulation;