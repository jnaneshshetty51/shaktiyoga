#!/bin/bash

# Shakti Yoga Deployment Script
# Run this script from the project root directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and configure it.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm ci --production=false

# Generate Prisma Client
echo -e "${GREEN}🗄️  Generating Prisma Client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Build Next.js application
echo -e "${GREEN}🏗️  Building Next.js application...${NC}"
npm run build

# Start/restart PM2
echo -e "${GREEN}🔄 Starting application with PM2...${NC}"
pm2 delete shakti-yoga 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}Application is running on port 3000${NC}"
echo -e "${YELLOW}Check status with: pm2 status${NC}"
echo -e "${YELLOW}View logs with: pm2 logs shakti-yoga${NC}"

