# Orangehost.com Deployment Guide

## Hosting Details
- **Provider**: Orangehost.com
- **Email**: saadhoccane2@gmail.com
- **Subdomain**: seller.egrocify.com
- **Panel**: cPanel (typically)

## Pre-Deployment Checklist

- [ ] Build the application: `pnpm build`
- [ ] Test production build locally: `pnpm start`
- [ ] Configure production environment variables
- [ ] Set up database connection (MongoDB)
- [ ] Configure payment gateway for live mode
- [ ] SSL certificate installed (usually auto with cPanel)

## Step 1: Prepare Production Build

### Local Testing
```bash
# Install dependencies
pnpm install

# Create production build
pnpm build

# Test production build
pnpm start
```

The build output will be in:
- `dist/` - Frontend assets
- `server/` - Backend server files

## Step 2: Access Orangehost Control Panel

1. Visit: **https://orangehost.com** (or your control panel URL)
2. Login with credentials:
   - Email: saadhoccane2@gmail.com
   - Password: egrocify786$

## Step 3: Setup Node.js Environment

### In cPanel:
1. Navigate to **"Setup Node.js App"** or **"Node.js Selector"**
2. Create new Node.js application:
   - **Node.js version**: 18.16.0 or higher
   - **Application root**: Choose your subdomain directory
   - **Application URL**: seller.egrocify.com
   - **Application startup file**: `server/index.ts` or `backend/index.js`

## Step 4: Upload Files via FTP/SFTP

### Using FileZilla or similar FTP Client:

**Connection Details**:
- **Host**: orangehost.com (or your FTP host)
- **Username**: Your cPanel username (from email)
- **Password**: egrocify786$
- **Port**: 21 (FTP) or 22 (SFTP)
- **Protocol**: SFTP (Recommended)

**Upload Location**:
```
/public_html/seller.egrocify.com/
```

**Files to Upload**:
```
├── dist/                    # Frontend build (React)
├── backend/                 # Backend files
├── server/                  # TypeScript server
├── node_modules/           # Dependencies (or let cPanel install)
├── package.json
├── package-lock.json       # or pnpm-lock.yaml
├── .env                    # Production environment variables
└── vite.config.ts
```

## Step 5: Configure Environment Variables

### Create `.env` on server:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/resellhub

# JWT
JWT_SECRET=your-very-secure-random-string-min-32-chars

# Alfa Payment Gateway (LIVE)
ALFALAH_MERCHANT_ID=YOUR_LIVE_MERCHANT_ID
ALFALAH_STORE_ID=YOUR_LIVE_STORE_ID
ALFALAH_MERCHANT_HASH=YOUR_LIVE_MERCHANT_HASH
ALFALAH_KEY1=YOUR_LIVE_KEY1
ALFALAH_KEY2=YOUR_LIVE_KEY2
ALFALAH_USERNAME=your_live_username
ALFALAH_PASSWORD=your_live_password
ALFALAH_API_URL=https://payments.bankalfalah.com/HS/api
PAYMENT_MODE=LIVE

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@seller.egrocify.com

# Application
VITE_APP_URL=https://seller.egrocify.com
ADMIN_EMAIL=admin@seller.egrocify.com
ADMIN_PASSWORD=change-this-secure-password
ADMIN_PHONE=+92xxxxxxxxxx
```

## Step 6: Install Dependencies

### Via cPanel Terminal or SSH:
```bash
cd /public_html/seller.egrocify.com/

# Install dependencies
npm install
# or
pnpm install

# Install pnpm globally (if needed)
npm install -g pnpm
```

## Step 7: Build Frontend Assets

```bash
# Build React frontend
pnpm build

# This creates the dist/ folder with all static assets
```

## Step 8: Configure Server Startup

### In cPanel Node.js app configuration:
- **Startup file**: `backend/index.js` or `server/index.ts`
- **Node.js version**: 18+
- **Environment variables**: Add custom variables matching `.env`

OR create `ecosystem.config.js` for PM2:
```javascript
module.exports = {
  apps: [{
    name: 'seller-egrocify',
    script: './backend/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Step 9: Configure Reverse Proxy

### In cPanel (if needed):
1. Go to **"Proxy" or "Reverse Proxy"**
2. Set up reverse proxy:
   - Domain: seller.egrocify.com
   - Target URL: http://localhost:3000
   - This routes web traffic to your Node.js server

## Step 10: Set SSL Certificate

### In cPanel:
1. Navigate to **"AutoSSL" or "SSL/TLS"**
2. Install free SSL certificate (usually pre-installed)
3. Verify HTTPS works: https://seller.egrocify.com

## Step 11: Configure Payment Callbacks

### Update Alfa Bank Merchant Portal:
1. Login to Alfa Merchant Portal
2. Update callback URLs:
   - **Return URL**: https://seller.egrocify.com/orders
   - **IPN Callback URL**: https://seller.egrocify.com/api/payment/callback

## Step 12: Database Connection

### MongoDB Atlas (Cloud Database):
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/resellhub?retryWrites=true&w=majority
```

1. Create MongoDB Atlas account (https://cloud.mongodb.com)
2. Create cluster
3. Create database user
4. Get connection string
5. Add to `.env`

**Start fresh database**:
```bash
# SSH into server
ssh user@orangehost.com

# Run seed script
node backend/seed.js
```

## Step 13: Test Deployment

### Test endpoints:
```bash
# Test API is running
curl https://seller.egrocify.com/api/auth/ping

# Test payment gateway setup
curl https://seller.egrocify.com/api/payment/test

# Test frontend is served
curl https://seller.egrocify.com
```

## Step 14: Monitor Application

### In cPanel:
1. View **"Error Logs"** at: `/home/username/logs/`
2. Monitor CPU/RAM usage
3. Check **"Metrics"** for uptime

### Access server logs:
```bash
# SSH into server
ssh user@orangehost.com

# View server logs
tail -f /home/username/logs/error.log
tail -f /home/username/logs/access.log

# Check Node.js app status
pm2 list
pm2 logs
```

## Common Issues & Fixes

### Issue: "Cannot find module"
```bash
# Solution: Install dependencies
cd /public_html/seller.egrocify.com/
npm install
```

### Issue: "Port already in use"
```bash
# Solution: Kill existing process
lsof -i :3000
kill -9 <PID>
```

### Issue: MongoDB connection timeout
- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Issue: SSL/HTTPS not working
- Check SSL certificate in cPanel
- Verify reverse proxy configuration
- Clear browser cache

### Issue: Static files not loading
```bash
# Ensure dist/ folder exists
pnpm build

# Check Nginx/Apache static file configuration
# Usually in cPanel's "Proxy" or web server settings
```

## Deployment Checklist

- [ ] Files uploaded to `/public_html/seller.egrocify.com/`
- [ ] `node_modules` installed
- [ ] `.env` configured with production variables
- [ ] Frontend built (`dist/` exists)
- [ ] Node.js app running in cPanel
- [ ] SSL certificate active (HTTPS)
- [ ] Database connected and tested
- [ ] Payment gateway in LIVE mode
- [ ] Callback URLs updated in Alfa Bank
- [ ] Email service configured
- [ ] Admin user created in database
- [ ] DNS pointing to Orangehost servers
- [ ] Site accessible at https://seller.egrocify.com
- [ ] Test payment completed successfully

## Maintenance

### Regular Tasks:
```bash
# Check logs
pm2 logs

# Monitor system resources
top

# Update dependencies (monthly)
npm update

# Backup database (weekly)
# Configure in cPanel backups
```

### Security:
- [ ] Keep Node.js updated
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Change default admin password
- [ ] Enable 2FA for cPanel
- [ ] Monitor error logs for attacks
- [ ] Rotate JWT_SECRET periodically

## Support

**Orangehost Support**:
- Email: support@orangehost.com
- Ticket System: https://orangehost.com/support
- Knowledge Base: https://orangehost.com/kb

**For Node.js Issues**:
- Access SSH terminal in cPanel
- Check error logs: `/home/username/logs/`
- Contact Orangehost Node.js support

## Quick SSH Commands

```bash
# Connect to server
ssh user@orangehost.com

# Navigate to app
cd /public_html/seller.egrocify.com/

# Check Node.js version
node --version

# Start Node.js app manually
node backend/index.js

# View live logs
pm2 logs

# Restart app
pm2 restart seller-egrocify

# Stop app
pm2 stop seller-egrocify
```

---

**Deployment Date**: 07/02/2026  
**Domain**: seller.egrocify.com  
**Hosting**: Orangehost.com
