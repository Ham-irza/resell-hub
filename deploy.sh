#!/bin/bash

# Orangehost Deployment Script
# Usage: ./deploy.sh
# This script builds and prepares your application for Orangehost deployment

set -e  # Exit on error

echo "🚀 Starting Orangehost Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Type checking
echo -e "${BLUE}Step 2: Running TypeScript check...${NC}"
pnpm typecheck || echo -e "${YELLOW}⚠ TypeScript warnings found${NC}"
echo ""

# Step 3: Build frontend
echo -e "${BLUE}Step 3: Building React frontend...${NC}"
pnpm build
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 4: Verify .env exists
echo -e "${BLUE}Step 4: Verifying environment configuration...${NC}"
if [ ! -f ".env.production.example" ]; then
  echo -e "${YELLOW}⚠ .env.production.example not found${NC}"
  echo "Create production .env with: cp .env.production.example .env.production"
else
  echo -e "${GREEN}✓ Environment template found${NC}"
fi
echo ""

# Step 5: Create deployment packages
echo -e "${BLUE}Step 5: Creating deployment artifacts...${NC}"
mkdir -p deployment

# Copy essential files
cp -r dist deployment/
cp -r backend deployment/
cp -r server deployment/
cp package.json deployment/
cp pnpm-lock.yaml deployment/ 2>/dev/null || cp package-lock.json deployment/ 2>/dev/null

echo -e "${GREEN}✓ Deployment files prepared${NC}"
echo ""

# Step 6: Create deployment archive
echo -e "${BLUE}Step 6: Creating compressed archive...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="seller-egrocify_${TIMESTAMP}.tar.gz"

tar -czf "$ARCHIVE" deployment/
echo -e "${GREEN}✓ Archive created: ${ARCHIVE}${NC}"
echo ""

# Step 7: Display deployment instructions
echo -e "${BLUE}Step 7: Deployment Instructions${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "1. Upload via FTP/SFTP:"
echo "   - Host: orangehost.com"
echo "   - Username: (from support email)"
echo "   - Password: egrocify786$"
echo "   - Upload to: /public_html/seller.egrocify.com/"
echo ""
echo "2. Files to upload:"
echo "   - ${ARCHIVE}"
echo ""
echo "3. SSH Commands (after upload):"
echo "   ssh user@orangehost.com"
echo "   cd /public_html/seller.egrocify.com/"
echo "   tar -xzf ${ARCHIVE}"
echo "   mv deployment/* ."
echo "   rm -rf deployment ${ARCHIVE}"
echo ""
echo "4. Install dependencies on server:"
echo "   pnpm install"
echo ""
echo "5. Create .env with production credentials:"
echo "   cp .env.production.example .env"
echo "   nano .env  # Edit with actual values"
echo ""
echo "6. Build assets on server:"
echo "   pnpm build"
echo ""
echo "7. Start application (cPanel will do this via Node.js selector)"
echo "   pm2 start backend/index.js --name seller-egrocify"
echo ""
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}✓ Build and packaging complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload ${ARCHIVE} to Orangehost"
echo "2. Extract files on server"
echo "3. Configure .env with production values"
echo "4. Configure Node.js app in cPanel"
echo "5. Test at https://seller.egrocify.com"
echo ""
