# AWS EC2 Deployment Steps for Chariot API

## Step 1: Create AWS EC2 Instance

### 1.1 Launch EC2 Instance
1. Go to AWS Console → EC2 → Instances → Launch Instance
2. **Name**: `chariot-api-server`
3. **AMI**: Amazon Linux 2023 (or Ubuntu 22.04 LTS)
4. **Instance Type**: t3.medium (2 vCPU, 4GB RAM) - minimum recommended
5. **Key Pair**: Create new or use existing SSH key pair
6. **Security Group**: Create new with these rules:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (3001) - 0.0.0.0/0 (for API access)

### 1.2 Configure Storage
- **Root Volume**: 20GB gp3 (minimum)
- **Additional Volume**: 50GB gp3 for application data (optional)

## Step 2: Connect to Your EC2 Instance

```bash
# Replace with your actual key file and instance details
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# Or for Ubuntu instances:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## Step 3: Set Up the Server

### 3.1 Run the Setup Script
```bash
# Download and run the EC2 setup script
curl -O https://raw.githubusercontent.com/your-username/chariot-api/main/apps/api/ec2-setup.sh
chmod +x ec2-setup.sh
sudo ./ec2-setup.sh
```

### 3.2 Alternative Manual Setup (if script fails)
```bash
# Update system
sudo yum update -y  # For Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Docker
sudo yum install -y docker  # Amazon Linux
# or
sudo apt install -y docker.io  # Ubuntu

sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git  # Amazon Linux
# or
sudo apt install -y git  # Ubuntu
```

## Step 4: Upload Your Application Code

### 4.1 Clone Your Repository
```bash
# Navigate to the application directory
cd /opt/chariot-api

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/your-username/chariot-api.git .

# Or if you have the code locally, upload it using SCP:
# scp -i "your-key.pem" -r /path/to/your/chariot-api ec2-user@your-ec2-ip:/opt/chariot-api/
```

### 4.2 Set Up Environment Variables
```bash
# Copy the production environment template
cp env.production.example .env

# Edit the environment file
nano .env
```

**Required Environment Variables:**
```env
# Database - Use MongoDB Atlas for production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chariot?retryWrites=true&w=majority

# PayPal Production Configuration
PAYPAL_CLIENT_ID=your_production_paypal_client_id
PAYPAL_CLIENT_SECRET=your_production_paypal_client_secret
PAYPAL_API_BASE=https://api-m.paypal.com

# Application
NODE_ENV=production
PORT=3001

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Step 5: Deploy the Application

### 5.1 Run the Deployment Script
```bash
# Make sure you're in the application directory
cd /opt/chariot-api

# Run the deployment script
./deploy.sh
```

### 5.2 Manual Deployment (if script fails)
```bash
# Build and start the application
docker-compose up --build -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 6: Configure Domain and SSL (Optional but Recommended)

### 6.1 Point Domain to EC2
1. Go to your domain registrar
2. Create an A record pointing to your EC2 public IP
3. Wait for DNS propagation (can take up to 48 hours)

### 6.2 Set Up SSL with Let's Encrypt
```bash
# Install Certbot
sudo yum install -y certbot  # Amazon Linux
# or
sudo apt install -y certbot  # Ubuntu

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration to use SSL certificates
```

## Step 7: Test Your Deployment

### 7.1 Health Check
```bash
# Test the API health endpoint
curl http://your-ec2-public-ip:3001/api/health

# Test through domain (if configured)
curl https://yourdomain.com/api/health
```

### 7.2 Monitor the Application
```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs -f api

# Monitor resource usage
docker stats

# Run the monitoring script
/opt/chariot-api/monitor.sh
```

## Step 8: Production Optimizations

### 8.1 Set Up Monitoring
```bash
# Install monitoring tools
sudo yum install -y htop iotop  # Amazon Linux
# or
sudo apt install -y htop iotop  # Ubuntu

# Set up log rotation
sudo nano /etc/logrotate.d/chariot-api
```

### 8.2 Configure Backups
```bash
# Test backup script
/opt/chariot-api/backup.sh

# Set up automated backups (already configured in setup script)
crontab -l
```

### 8.3 Security Hardening
```bash
# Update firewall rules
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Disable root login (if not already done)
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

## Troubleshooting Common Issues

### Application Won't Start
```bash
# Check logs
docker-compose logs api

# Check environment variables
docker-compose config

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check MongoDB connection
docker-compose logs mongodb

# Test connection from container
docker-compose exec api node -e "console.log(process.env.MONGO_URI)"
```

### High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Restart containers
docker-compose restart
```

## Useful Commands

```bash
# Application management
sudo systemctl start chariot-api
sudo systemctl stop chariot-api
sudo systemctl restart chariot-api
sudo systemctl status chariot-api

# Docker management
docker-compose down
docker-compose up -d
docker-compose logs -f
docker-compose restart

# Monitoring
/opt/chariot-api/monitor.sh
/opt/chariot-api/backup.sh
htop
docker stats
```

## Next Steps After Deployment

1. **Set up monitoring alerts** (CloudWatch, etc.)
2. **Configure automated backups** to S3
3. **Set up CI/CD pipeline** for automated deployments
4. **Configure load balancing** if scaling is needed
5. **Set up database backups** and replication
6. **Implement security scanning** and updates

## Support and Maintenance

- **Logs**: `/opt/chariot-api/logs/`
- **Backups**: `/opt/chariot-api/backups/`
- **Configuration**: `/opt/chariot-api/.env`
- **Monitoring**: `/opt/chariot-api/monitor.sh`

Remember to keep your EC2 instance updated and monitor resource usage regularly!
