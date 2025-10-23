#!/bin/bash

# Chariot API Deployment Script for AWS EC2
# This script deploys the API application to AWS EC2 using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="chariot-api"
DOCKER_IMAGE="chariot-api"
CONTAINER_NAME="chariot-api"
PORT=3001
NGINX_PORT=80

echo -e "${BLUE}🚀 Starting Chariot API Deployment${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found.${NC}"
    echo -e "${YELLOW}📝 Please create a .env file with your configuration values.${NC}"
    echo -e "${BLUE}You can copy from env.production.example and update with your actual values:${NC}"
    echo -e "${BLUE}  cp env.production.example .env${NC}"
    echo -e "${BLUE}  nano .env${NC}"
    echo -e ""
    echo -e "${YELLOW}Required variables:${NC}"
    echo -e "  - MONGO_URI (MongoDB Atlas connection string)"
    echo -e "  - PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET"
    echo -e "  - AWS credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY)"
    echo -e "  - SMTP settings for email"
    echo -e "  - JWT secrets for authentication"
    echo -e ""
    exit 1
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans || true

# Remove old images to free up space
echo -e "${BLUE}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f || true

# Build and start the application
echo -e "${BLUE}🔨 Building and starting the application...${NC}"
docker-compose up --build -d

# Wait for the application to start
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 30

# Check if the application is running
echo -e "${BLUE}🔍 Checking application health...${NC}"
if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 API is available at: http://localhost:${PORT}${NC}"
    echo -e "${GREEN}🏥 Health check: http://localhost:${PORT}/api/health${NC}"
else
    echo -e "${RED}❌ Application failed to start or is not responding${NC}"
    echo -e "${YELLOW}📋 Checking container logs...${NC}"
    docker-compose logs --tail=50
    exit 1
fi

# Show running containers
echo -e "${BLUE}📊 Running containers:${NC}"
docker-compose ps

# Show resource usage
echo -e "${BLUE}📈 Resource usage:${NC}"
docker stats --no-stream

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "   View logs: docker-compose logs -f"
echo -e "   Stop app: docker-compose down"
echo -e "   Restart app: docker-compose restart"
echo -e "   Update app: ./deploy.sh"
