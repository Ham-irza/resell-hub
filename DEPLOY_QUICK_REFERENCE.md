# Quick Reference: Orangehost Deployment

## Hosting Information
```
Domain: seller.egrocify.com
Host: orangehost.com
Email: saadhoccane2@gmail.com
Password: egrocify786$
```

## Pre-Deployment (On Your Computer)

### 1. Build the Project
```powershell
# Windows PowerShell
pnpm install
pnpm build

# Run deployment script
.\deploy.bat
```

### 2. Verify Build Output
- ✓ `dist/` folder exists (React frontend)
- ✓ `backend/` folder exists
- ✓ `server/` folder exists

## Deployment (Upload to Orangehost)

### Step 1: FTP Upload
```
1. Open FileZilla or WinSCP
2. Connection:
   - Host: orangehost.com
   - Username: (from support email - usually cPanel username)
   - Password: egrocify786$
   - Port: 22 (SFTP) or 21 (FTP)
   
3. Upload to: /public_html/seller.egrocify.com/
4. Upload files:
   - dist/ (entire folder)
   - backend/ (entire folder)
   - server/ (entire folder)
   - package.json
   - pnpm-lock.yaml
   - .env.production.example
```

### Step 2: SSH Terminal (cPanel)
```bash
# 1. Login to cPanel Terminal or SSH
ssh user@orangehost.com

# 2. Navigate to app directory
cd /public_html/seller.egrocify.com/

# 3. List files to verify upload
ls -la

# 4. Install dependencies
pnpm install

# 5. Create production .env
cp .env.production.example .env

# 6. Edit .env with actual values
nano .env
# Press Ctrl+O to save, Ctrl+X to exit
```

### Step 3: Update Environment Variables

Edit `.env` with these values:

```env
# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/resellhub

# JWT Secret (generate random)
JWT_SECRET=<generate_random_32_char_string>

# Alfa Payment Gateway LIVE (from Alfa Merchant Portal)
ALFALAH_MERCHANT_ID=<live_merchant_id>
ALFALAH_STORE_ID=<live_store_id>
ALFALAH_KEY1=<live_key1>
ALFALAH_KEY2=<live_key2>
PAYMENT_MODE=LIVE

# Email
EMAIL_USER=<your_email@gmail.com>
EMAIL_PASS=<gmail_app_password>

# Admin account
ADMIN_PASSWORD=<strong_new_password>
```

### Step 4: Configure Node.js in cPanel

```
1. Login to Orangehost cPanel
   - URL: https://orangehost.com/cpanel
   - Email: saadhoccane2@gmail.com
   - Password: egrocify786$

2. Find "Node.js Selector" or "Setup Node.js App"

3. Create Application:
   - Node.js version: 18.16.0+
   - Application root: /public_html/seller.egrocify.com
   - Application URL: seller.egrocify.com
   - Application startup file: backend/index.js
   - Environment: Production

4. Click "Create"
```

### Step 5: Verify Deployment

```bash
# Test API
curl https://seller.egrocify.com/api/payment/test

# Check logs
pm2 logs
```

## Common Issues & Quick Fixes

### Issue: "Cannot find module 'express'"
```bash
cd /public_html/seller.egrocify.com/
pnpm install
```

### Issue: "MongoDB connection timeout"
- Check `.env` MONGO_URI is correct
- In MongoDB Atlas: Add Orangehost IP to whitelist
- Get server IP: `curl ifconfig.me` (in SSH)

### Issue: "Port 3000 already in use"
```bash
# Kill existing process
lsof -i :3000
kill -9 <PID>

# Or restart via cPanel
```

### Issue: "HTTPS/SSL not working"
- In cPanel: Check "AutoSSL" for free SSL
- Wait 24 hours for DNS to propagate
- Clear browser cache

### Issue: "/backend/index.js not found"
```bash
# Verify file exists
ls -la /public_html/seller.egrocify.com/backend/

# Check startup file path in cPanel is correct
# Should be: backend/index.js (relative path)
```

## Monitoring & Logs

```bash
# SSH into server
ssh user@orangehost.com
cd /public_html/seller.egrocify.com/

# View real-time logs
pm2 logs

# View error logs
cat /home/user/logs/error.log

# View access logs
cat /home/user/logs/access.log
```

## Payment Gateway Setup

### For Live Transactions:
1. Go to https://merchants.bankalfalah.com/merchantportal
2. Login with Alfa credentials
3. Go Live → Step 2
4. Copy live credentials to `.env`:
   - ALFALAH_MERCHANT_ID
   - ALFALAH_STORE_ID
   - ALFALAH_KEY1
   - ALFALAH_KEY2

### Update Callback URLs in Alfa Portal:
- Return URL: `https://seller.egrocify.com/orders`
- IPN URL: `https://seller.egrocify.com/api/payment/callback`

### Test Live Payment:
```bash
# Use small amount (1-10 PKR) for testing
curl -X POST https://seller.egrocify.com/api/payment/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "orderId": "test-123",
    "amount": 10,
    "description": "Test Payment"
  }'
```

## Checklist

- [ ] Build completed locally
- [ ] Files uploaded to Orangehost
- [ ] Dependencies installed on server
- [ ] `.env` configured with production values
- [ ] Node.js app created in cPanel
- [ ] Site accessible at https://seller.egrocify.com
- [ ] API responding: `/api/payment/test`
- [ ] Database connected
- [ ] Alfa Payment Gateway on LIVE mode
- [ ] Callback URLs updated
- [ ] Admin account created
- [ ] Test payment completed

## Support Contacts

**Orangehost Support**: support@orangehost.com
**cPanel Documentation**: https://cpanel.net/
**Node.js Docs**: https://nodejs.org/docs/

---

**Deployment Date: 07/02/2026**
**Domain: seller.egrocify.com**
**Subdomain of: egrocify.com**
