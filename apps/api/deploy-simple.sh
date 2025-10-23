#!/bin/bash

# Simple Chariot API Deployment Script for AWS EC2
# This script deploys the API application using basic Docker commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Chariot API Deployment (Simple Mode)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found.${NC}"
    echo -e "${YELLOW}📝 Please create a .env file with your configuration values.${NC}"
    echo -e "${BLUE}You can copy from env.example and update with your actual values:${NC}"
    echo -e "${BLUE}  cp env.example .env${NC}"
    echo -e "${BLUE}  nano .env${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker stop chariot-api chariot-nginx 2>/dev/null || true
docker rm chariot-api chariot-nginx 2>/dev/null || true

# Remove old images to free up space
echo -e "${BLUE}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f || true

# Build the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker build -t chariot-api .

# Start the API container
echo -e "${BLUE}🚀 Starting API container...${NC}"
docker run -d \
  --name chariot-api \
  --env-file .env \
  -p 3001:3001 \
  --restart unless-stopped \
  chariot-api

# Start Nginx container
echo -e "${BLUE}🌐 Starting Nginx container...${NC}"
docker run -d \
  --name chariot-nginx \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  --restart unless-stopped \
  nginx:alpine

# Wait for the application to start
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 30

# Check if the application is running
echo -e "${BLUE}🔍 Checking application health...${NC}"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 API is available at: http://localhost:3001${NC}"
    echo -e "${GREEN}🏥 Health check: http://localhost:3001/api/health${NC}"
    echo -e "${GREEN}🌐 Nginx proxy: http://localhost${NC}"
else
    echo -e "${RED}❌ Application failed to start or is not responding${NC}"
    echo -e "${YELLOW}📋 Checking container logs...${NC}"
    docker logs chariot-api --tail=50
    exit 1
fi

# Show running containers
echo -e "${BLUE}📊 Running containers:${NC}"
docker ps --filter "name=chariot"

# Show resource usage
echo -e "${BLUE}📈 Resource usage:${NC}"
docker stats --no-stream --filter "name=chariot"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "   View API logs: docker logs chariot-api -f"
echo -e "   View Nginx logs: docker logs chariot-nginx -f"
echo -e "   Stop app: docker stop chariot-api chariot-nginx"
echo -e "   Restart app: docker restart chariot-api chariot-nginx"
echo -e "   Update app: ./deploy-simple.sh"
