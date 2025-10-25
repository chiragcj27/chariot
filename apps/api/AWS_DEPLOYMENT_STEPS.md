# AWS EC2 Deployment Guide - Chariot API

Complete step-by-step guide to deploy Chariot API on AWS EC2.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS EC2 Instance                         │
│              (Ubuntu 22.04 LTS, t3.medium)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Docker Containers                           │   │
│  │  ┌─────────────────┐   ┌──────────────────────────┐  │   │
│  │  │  Nginx Proxy    │   │  Chariot API (Node.js)  │  │   │
│  │  │  Port: 80/443   │──▶│  Port: 3001              │  │   │
│  │  └─────────────────┘   │  Express + Mongoose      │  │   │
│  │                        │  Puppeteer for PDF       │  │   │
│  │                        └──────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  External Connections:                                      │
│  ├─ MongoDB Atlas (Database)                               │
│  ├─ AWS S3 (File Storage)                                  │
│  ├─ PayPal API (Payments)                                  │
│  └─ SMTP (Email)                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Pre-Deployment Requirements

### AWS Setup

1. **AWS Account** - Active and verified
2. **IAM User** - With EC2 and S3 permissions
3. **Key Pair** - Created and downloaded
4. **S3 Bucket** - For file uploads

### External Services

1. **MongoDB Atlas** - Cluster created and accessible
2. **PayPal** - Sandbox credentials obtained
3. **SMTP** - Gmail App Password or AWS SES
4. **Domain** - (Optional) For production use

---

## 🚀 Step 1: Launch EC2 Instance

### 1.1 Create Instance

1. Go to **AWS Console → EC2 → Instances → Launch Instance**
2. **Name**: `chariot-api-server`
3. **AMI**: Ubuntu 22.04 LTS (ami-xxxx)
4. **Instance Type**: `t3.medium` (2 vCPU, 4GB RAM)
5. **Key Pair**: Select or create SSH key
6. **Security Group**: Create new with rules below

### 1.2 Security Group Rules

```
Inbound Rules:
  Type              Port    Source
  SSH               22      Your IP / 0.0.0.0/0
  HTTP              80      0.0.0.0/0
  HTTPS             443     0.0.0.0/0
  Custom TCP        3001    0.0.0.0/0

Outbound Rules:
  All traffic allowed (default)
```

### 1.3 Storage Configuration

```
Root Volume:
  - Type: gp3
  - Size: 20GB (minimum)
  - Delete on Termination: Checked
  
Optional:
  - Additional volume for data: 50GB gp3
```

### 1.4 Launch Instance

1. Review settings
2. Click **Launch Instance**
3. Wait for instance to be in **Running** state
4. Note the **Public IPv4 address**

---

## 🔑 Step 2: Connect to EC2 Instance

### 2.1 Prepare SSH Key

```bash
# On your local machine
chmod 400 /path/to/your-key.pem
```

### 2.2 Connect via SSH

```bash
# Ubuntu AMI
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Amazon Linux 2
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

### 2.3 Verify Connection

```bash
# Should show Ubuntu version info
uname -a

# Update system
sudo apt update && sudo apt upgrade -y
```

---

## ⚙️ Step 3: Set Up Server Infrastructure

### 3.1 Download Setup Script

```bash
# Download from GitHub
curl -O https://raw.githubusercontent.com/your-username/chariot/main/apps/api/ec2-setup.sh

# Or copy from local and upload
scp -i "your-key.pem" apps/api/ec2-setup.sh ubuntu@your-ec2-ip:/home/ubuntu/

# Make executable
chmod +x ec2-setup.sh
```

### 3.2 Run Setup Script

```bash
# Run with sudo
sudo ./ec2-setup.sh
```

**This installs:**
- ✅ Docker & Docker Compose
- ✅ Node.js 18 & npm
- ✅ pnpm (Node.js package manager)
- ✅ Git
- ✅ Firewall (Amazon Linux 2)
- ✅ Monitoring scripts
- ✅ Backup automation
- ✅ Log rotation
- ✅ Systemd service

### 3.3 Verify Installation

```bash
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version
npm --version
pnpm --version

# Check services
sudo systemctl status docker
sudo systemctl list-unit-files | grep chariot
```

---

## 📦 Step 4: Clone Application Code

### 4.1 Clone Repository

```bash
cd /opt/chariot-api

# Clone from GitHub
git clone https://github.com/your-username/chariot.git .

# If uploading locally
# Use scp to upload the entire directory
scp -i "your-key.pem" -r /path/to/chariot ubuntu@your-ec2-ip:/opt/chariot-api/
```

### 4.2 Verify Directory Structure

```bash
cd /opt/chariot-api

# Should see:
ls -la

# Output should include:
# apps/           (API, admin-portal, seller-portal, website)
# packages/       (shared packages)
# package.json    (monorepo root)
# docker-compose.yml
# .env            (will create next)
```

---

## 🔐 Step 5: Configure Environment Variables

### 5.1 Create .env File

```bash
cd /opt/chariot-api

# Copy from template
cp apps/api/env.example .env

# Verify it was created
cat .env
```

### 5.2 Edit .env File

```bash
# Open editor
nano .env

# Or use vi
vi .env
```

### 5.3 Configure All Variables

**Fill in all required variables:**

```env
# ============ APPLICATION ============
NODE_ENV=production
PORT=3001

# ============ DATABASE ============
# MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/chariot?retryWrites=true&w=majority
MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/chariot"

# ============ PAYPAL ============
# Get from PayPal Developer Dashboard
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
# For production: https://api-m.paypal.com
# For sandbox: https://api-m.sandbox.paypal.com
PAYPAL_API_BASE="https://api-m.sandbox.paypal.com"

# ============ AWS S3 ============
# AWS region where bucket is located
AWS_REGION="eu-north-1"
# AWS IAM user access key
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
# AWS IAM user secret key
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
# S3 bucket name
AWS_S3_BUCKET="chariot-images-bucket"

# ============ EMAIL (SMTP) ============
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
# Gmail App Password (not your main password!)
SMTP_PASS="your-app-specific-password"

# ============ URLS ============
SELLER_PORTAL_URL="https://seller.yourdomain.com"

# ============ SECURITY ============
# Generate strong random values:
# openssl rand -hex 32
JWT_SECRET="generate-with-openssl-rand-hex-32"
REFRESH_TOKEN_SECRET="generate-with-openssl-rand-hex-32"

# ============ THIRD-PARTY ============
HEYZINE_CLIENT_ID="your_heyzine_client_id"
```

### 5.4 Secure the .env File

```bash
# Set permissions (owner read/write only)
chmod 600 .env

# Verify permissions
ls -la .env
# Output: -rw------- 1 ubuntu ubuntu ...
```

### 5.5 Validate Configuration

```bash
# Test MongoDB connection
docker-compose exec api node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });
"

# Verify AWS credentials
docker-compose exec api node -e "
const aws = require('@aws-sdk/client-s3');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
console.log('✅ AWS config loaded');
"
```

---

## 🐳 Step 6: Build & Deploy with Docker

### 6.1 Navigate to App Directory

```bash
cd /opt/chariot-api

# Verify .env exists
ls -la | grep env
```

### 6.2 Build Docker Image

```bash
# This will take 10-15 minutes
docker-compose up --build -d

# Or with verbose output
docker-compose -f docker-compose.yml up --build
```

### 6.3 Wait for Startup

```bash
# Wait 60 seconds for containers to start
sleep 60

# Check container status
docker ps

# Should see:
# chariot-api (healthy or running)
# chariot-nginx (running)
```

### 6.4 Check Application Health

```bash
# Test health endpoint directly
curl http://localhost:3001/api/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}

# Test through Nginx proxy
curl http://localhost/api/health

# Test external (if domain configured)
curl http://your-ec2-public-ip:3001/api/health
```

---

## 📊 Step 7: Verify Deployment

### 7.1 Check Containers

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container details
docker inspect chariot-api
docker inspect chariot-nginx
```

### 7.2 View Application Logs

```bash
# API logs
docker-compose logs api

# Follow logs in real-time
docker-compose logs -f api

# Last 100 lines
docker-compose logs api --tail=100

# Nginx logs
docker-compose logs nginx
```

### 7.3 Monitor Resources

```bash
# Real-time resource usage
docker stats

# One-time snapshot
docker stats --no-stream

# System resources
free -h          # Memory usage
df -h            # Disk usage
top -bn1 | head  # CPU usage
```

### 7.4 Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Test with actual endpoint (example)
curl -X GET http://localhost:3001/api/products

# With authentication token (if needed)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/protected-endpoint
```

---

## 🌐 Step 8: Domain & SSL Setup (Optional)

### 8.1 Point Domain to EC2

1. Go to your domain registrar
2. Update DNS A record → EC2 Public IP
3. Wait for propagation (5 min - 48 hours)
4. Verify: `dig yourdomain.com` or `nslookup yourdomain.com`

### 8.2 Install SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (stop Nginx temporarily)
docker-compose pause nginx
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/chariot-api/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/chariot-api/ssl/
sudo chown ubuntu:ubuntu /opt/chariot-api/ssl/*
sudo chmod 600 /opt/chariot-api/ssl/*

# Restart Nginx
docker-compose unpause nginx
docker-compose restart nginx

# Verify SSL
curl https://yourdomain.com/api/health
```

---

## ✨ Step 9: Post-Deployment Verification

### 9.1 Manual Testing

```bash
# Health endpoint
curl http://localhost:3001/api/health

# Check database
curl http://localhost:3001/api/admin/status

# Test file upload (if available)
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test.jpg"

# PayPal integration
curl http://localhost:3001/api/subscribe/plans
```

### 9.2 Monitoring

```bash
# Run monitoring script
/opt/chariot-api/monitor.sh

# Manual monitoring
echo "=== System ===" && free -h && df -h
echo "=== Docker ===" && docker ps -a
echo "=== Stats ===" && docker stats --no-stream
echo "=== Logs ===" && docker-compose logs api --tail=50
```

### 9.3 Create Backup

```bash
# Manual backup test
/opt/chariot-api/backup.sh

# Verify backup created
ls -la /opt/chariot-api/backups/

# Expected: .env and database backups
```

---

## 🔄 Step 10: Automate & Maintain

### 10.1 Verify Cron Jobs

```bash
# View cron jobs
crontab -l

# Should include:
# 0 2 * * * /opt/chariot-api/backup.sh
# */5 * * * * /opt/chariot-api/monitor.sh
```

### 10.2 Verify Systemd Service

```bash
# Service status
sudo systemctl status chariot-api

# Service logs
sudo journalctl -u chariot-api -f

# View last 50 lines
sudo journalctl -u chariot-api -n 50
```

### 10.3 Regular Maintenance Commands

```bash
# Daily: Check health
curl http://localhost:3001/api/health

# Weekly: View logs for errors
docker-compose logs api --since 7d | grep -i error

# Monthly: Update code
cd /opt/chariot-api
git pull origin main
docker-compose down
docker-compose up --build -d

# Quarterly: Full backup and test restore
/opt/chariot-api/backup.sh
```

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# 1. Check logs
docker-compose logs api

# 2. Verify .env exists and has correct permissions
ls -la .env
cat .env | head -5

# 3. Check Docker container
docker inspect chariot-api

# 4. Restart
docker-compose restart api

# 5. Rebuild if needed
docker-compose down
docker-compose up --build -d
```

### Database Connection Error

```bash
# 1. Verify MONGO_URI format
grep MONGO_URI .env

# 2. Test connection from container
docker-compose exec api node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌', err.message));
"

# 3. Check MongoDB Atlas whitelist
# Go to MongoDB Atlas → Network Access
# Ensure EC2 IP is whitelisted

# 4. Verify credentials
echo $MONGO_URI
```

### High Memory Usage

```bash
# Check memory
free -h
docker stats

# Restart containers
docker-compose restart

# Check for memory leaks
docker-compose logs api | grep -i memory | tail -10

# View resource limits
cat docker-compose.yml | grep -A 10 "deploy:"
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Or change port in .env and restart
# Edit .env: PORT=3002
docker-compose down
docker-compose up -d
```

---

## 📞 Support & Resources

| Issue | Resolution |
|-------|-----------|
| Deployment fails | Check logs: `docker-compose logs` |
| No database connection | Verify MongoDB IP whitelist and MONGO_URI |
| High memory | Restart: `docker-compose restart` |
| SSL issues | Verify certificates in ./ssl directory |
| Payment fails | Check PayPal credentials and webhook |

---

## ✅ Deployment Verification Checklist

- [ ] EC2 instance launched and running
- [ ] SSH connection successful
- [ ] Docker and dependencies installed
- [ ] Code cloned to /opt/chariot-api
- [ ] .env file created with all variables
- [ ] Docker containers built and running
- [ ] Health endpoint responds (200)
- [ ] Database connection verified
- [ ] Nginx proxy working
- [ ] Monitoring scripts running
- [ ] Backups automated
- [ ] Logs rotated
- [ ] Security group configured correctly
- [ ] SSL certificate installed (if using domain)
- [ ] All external services connected

---

## 🎯 Next Steps

1. ✅ **Monitor** - Run `/opt/chariot-api/monitor.sh` daily
2. ✅ **Backup** - Verify daily backups at 2 AM
3. ✅ **Update** - Keep dependencies updated
4. ✅ **Scale** - Add load balancer when needed
5. ✅ **Optimize** - Monitor and optimize performance
6. ✅ **Secure** - Rotate credentials every 90 days

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Production Ready:** ☐ Yes  ☐ No
