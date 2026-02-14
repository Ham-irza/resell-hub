const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification'); 
const Product = require('../models/Product');
const { sendPayoutEmail } = require('../utils/emailService');

const startSimulation = () => {
  // Schedule task to run once daily at midnight
  // 30-day cycle: sell ~1/30th of items each day
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 AUTO-SELL SIMULATION STARTED: Processing orders...');

    try {
      // 1. Find all orders that are in 'auto-selling' status
      const activeOrders = await Order.find({ status: 'auto-selling' });

      if (activeOrders.length === 0) {
        console.log('✅ No orders in auto-sell queue.');
        return;
      }

      console.log(`Processing ${activeOrders.length} orders for auto-sell...`);

      // 2. Loop through each order and simulate sales
      for (const order of activeOrders) {
        const remainingItems = order.totalQuantity - order.itemsSold;
        
        if (remainingItems <= 0) {
          // Order already complete, mark it
          order.status = 'completed';
          await order.save();
          continue;
        }

        // --- LOGIC: Sell items over 30 days ---
        // Each day sell ~1/30th of remaining items
        // On day 1: ~3.3%, day 2: ~3.4%, etc.
        // This ensures complete cycle in approximately 30 days
        const daysElapsed = Math.ceil((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const expectedSoldByNow = Math.floor((order.totalQuantity * daysElapsed) / 30);
        
        // Items to sell today to keep on track
        let itemsToSellToday = expectedSoldByNow - order.itemsSold;
        
        // Ensure at least 1 item sells per day if available
        if (itemsToSellToday < 1 && remainingItems > 0) {
          itemsToSellToday = 1;
        }
        
        // Don't oversell
        if (itemsToSellToday > remainingItems) {
          itemsToSellToday = remainingItems;
        }
        
        // Calculate profit per item based on ROI
        const profitPerItem = (order.pricePerItem * order.roi) / 100;
        const profitGainedToday = profitPerItem * itemsToSellToday;

        // Update order progress
        order.itemsSold += itemsToSellToday;
        order.lastProcessedDate = new Date();

        // Check if cycle is finished (all items sold)
        if (order.itemsSold >= order.totalQuantity) {
          order.itemsSold = order.totalQuantity;
          order.status = 'completed';
          
          // Calculate total profit
          const totalProfit = profitPerItem * order.totalQuantity;
          const totalPayout = order.totalAmount + totalProfit;
          
          await order.save();

          // Find user and add to wallet
          const user = await User.findById(order.user);
          if (user) {
            user.walletBalance += totalPayout;
            await user.save();
            
            // Log the Payout Transaction
            await Transaction.create({
              user: user._id,
              type: 'profit_payout',
              amount: totalPayout,
              status: 'approved',
              description: `Auto-sell Complete: ${order.productName} (${order.totalQuantity} items)`
            });

            // Notify User
            await Notification.create({
              user: user._id,
              message: `🎉 All ${order.totalQuantity} items of "${order.productName}" sold! Payout of PKR ${totalPayout.toLocaleString()} added to wallet.`
            });

            // Send Email
            sendPayoutEmail(user.email, user.name, totalPayout, order.productName);

            console.log(`💰 PAYOUT: User ${user.name} received PKR ${totalPayout} from ${order.productName}`);
          }

        } else {
          // Not complete yet, just update progress
          await order.save();
          
          // Notify user of daily progress
          await Notification.create({
            user: order.user,
            message: `📦 ${itemsToSellToday} item(s) of "${order.productName}" sold today! Profit: PKR ${Math.round(profitGainedToday)}`
          });

          console.log(`📈 UPDATE: Order ${order._id} - ${itemsToSellToday} items sold, ${order.itemsSold}/${order.totalQuantity} total`);
        }
      }
      
      console.log('✅ Auto-sell simulation completed successfully.');

    } catch (error) {
      console.error('❌ SIMULATION ERROR:', error);
    }
  });
};

module.exports = startSimulation;
