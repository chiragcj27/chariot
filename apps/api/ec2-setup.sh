#!/bin/bash

# AWS EC2 Setup Script for Chariot API
# Fully fixed for Amazon Linux 2023

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up AWS EC2 instance for Chariot API${NC}"

# Update system packages
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo yum update -y

# Install Docker
echo -e "${BLUE}🐳 Installing Docker...${NC}"
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo -e "${BLUE}🔧 Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o docker-compose
sudo mv docker-compose /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo -e "${BLUE}📥 Installing Git...${NC}"
sudo yum install -y git

# Install Node.js
echo -e "${BLUE}📦 Installing Node.js...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
echo -e "${BLUE}📦 Installing pnpm...${NC}"
sudo npm install -g pnpm

# Install additional tools (skip curl to avoid conflict)
echo -e "${BLUE}🛠️  Installing additional tools...${NC}"
sudo yum install -y htop vim wget unzip

# Install cron
echo -e "${BLUE}⏰ Installing cron...${NC}"
sudo yum install -y cronie
sudo systemctl enable crond
sudo systemctl start crond

# Configure firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow HTTP, HTTPS, and app port
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Create application directory
echo -e "${BLUE}📁 Creating application directory...${NC}"
sudo mkdir -p /opt/chariot-api
sudo chown ec2-user:ec2-user /opt/chariot-api

# Create systemd service
echo -e "${BLUE}⚙️  Creating systemd service...${NC}"
sudo tee /etc/systemd/system/chariot-api.service > /dev/null <<EOF
[Unit]
Description=Chariot API Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/chariot-api
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable chariot-api.service

# Log rotation
echo -e "${BLUE}📋 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/chariot-api > /dev/null <<EOF
/opt/chariot-api/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
EOF

# Monitoring script
echo -e "${BLUE}📊 Creating monitoring script...${NC}"
sudo tee /opt/chariot-api/monitor.sh > /dev/null <<'EOF'
#!/bin/bash
echo "=== Chariot API Status ==="
echo "Date: $(date)"
echo ""
echo "=== Docker Status ==="
docker ps --filter "name=chariot-api"
echo ""
echo "=== Application Health ==="
curl -s http://localhost:3001/api/health | jq . || echo "Health check failed"
echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""
echo "=== Disk Usage ==="
df -h /opt/chariot-api
EOF

sudo chmod +x /opt/chariot-api/monitor.sh
sudo chown ec2-user:ec2-user /opt/chariot-api/monitor.sh

# Backup script
echo -e "${BLUE}💾 Creating backup script...${NC}"
sudo tee /opt/chariot-api/backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/chariot-api/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
echo "Creating backup: $DATE"
cp .env $BACKUP_DIR/.env.$DATE
docker run --rm -v chariot-api_mongodb_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/mongodb_data.$DATE.tar.gz -C /data .
echo "Backup completed: $BACKUP_DIR"
EOF

sudo chmod +x /opt/chariot-api/backup.sh
sudo chown ec2-user:ec2-user /opt/chariot-api/backup.sh

# Update script
echo -e "${BLUE}🔄 Creating update script...${NC}"
sudo tee /opt/chariot-api/update.sh > /dev/null <<'EOF'
#!/bin/bash
set -e
echo "🔄 Updating Chariot API..."
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sleep 30
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Update successful!"
else
    echo "❌ Update failed - rolling back..."
    git reset --hard HEAD~1
    docker-compose up -d
fi
EOF

sudo chmod +x /opt/chariot-api/update.sh
sudo chown ec2-user:ec2-user /opt/chariot-api/update.sh

# Create logs directory
mkdir -p /opt/chariot-api/logs
sudo chown ec2-user:ec2-user /opt/chariot-api/logs

# Setup cron jobs
echo -e "${BLUE}⏰ Setting up cron jobs...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/chariot-api/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/chariot-api/monitor.sh >> /opt/chariot-api/logs/monitor.log 2>&1") | crontab -

echo -e "${GREEN}✅ EC2 setup completed successfully!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "   1. Clone your repository to /opt/chariot-api"
echo -e "   2. Copy your .env file to /opt/chariot-api"
echo -e "   3. Run: cd /opt/chariot-api && ./deploy.sh"
echo -e "   4. Check status: sudo systemctl status chariot-api"
echo -e "   5. View logs: docker-compose logs -f"
echo -e ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo -e "   Monitor: /opt/chariot-api/monitor.sh"
echo -e "   Backup: /opt/chariot-api/backup.sh"
echo -e "   Update: /opt/chariot-api/update.sh"
echo -e "   Service: sudo systemctl start/stop/restart chariot-api"
