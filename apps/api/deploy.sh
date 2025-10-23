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
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}📝 Please update the .env file with your actual configuration values.${NC}"
        echo -e "${YELLOW}   Required variables: MONGO_URI, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET${NC}"
        read -p "Press Enter to continue after updating .env file..."
    else
        echo -e "${RED}❌ No env.example file found. Please create a .env file with required variables.${NC}"
        exit 1
    fi
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
