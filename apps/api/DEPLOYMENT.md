# Chariot API Deployment Guide

This guide covers deploying the Chariot API to AWS EC2 using Docker containers.

## Prerequisites

- AWS EC2 instance (recommended: t3.medium or larger)
- Ubuntu 20.04+ or Amazon Linux 2
- SSH access to the EC2 instance
- Domain name (optional, for production)

## Quick Start

### 1. Initial EC2 Setup

Connect to your EC2 instance and run the setup script:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/your-repo/chariot-api/main/ec2-setup.sh
chmod +x ec2-setup.sh
sudo ./ec2-setup.sh
```

### 2. Deploy the Application

```bash
# Clone the repository
cd /opt/chariot-api
git clone https://github.com/your-repo/chariot-api.git .

# Copy environment configuration
cp env.example .env
# Edit .env with your actual values

# Deploy the application
./deploy.sh
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/chariot

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_BASE=https://api-m.paypal.com

# Application
NODE_ENV=production
PORT=3001

# Puppeteer (for PDF generation)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Docker Commands

### Basic Operations

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Update the application
docker-compose pull
docker-compose up -d
```

### Monitoring

```bash
# Check application health
curl http://localhost:3001/api/health

# View container status
docker-compose ps

# Monitor resource usage
docker stats

# Run monitoring script
/opt/chariot-api/monitor.sh
```

## Production Configuration

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update nginx.conf with SSL configuration
3. Update docker-compose.yml to mount SSL certificates

### Database Configuration

For production, consider using:
- AWS RDS for MongoDB Atlas
- External MongoDB instance
- Database clustering for high availability

### Security Considerations

1. **Firewall Configuration**
   ```bash
   # Allow only necessary ports
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use AWS Secrets Manager for sensitive data
   - Rotate API keys regularly

3. **Container Security**
   - Run containers as non-root user
   - Keep base images updated
   - Scan images for vulnerabilities

## Monitoring and Logging

### Application Monitoring

```bash
# Check application status
sudo systemctl status chariot-api

# View application logs
docker-compose logs -f api

# Monitor resource usage
htop
docker stats
```

### Automated Backups

The setup includes automated daily backups:

```bash
# Manual backup
/opt/chariot-api/backup.sh

# View backup files
ls -la /opt/chariot-api/backups/
```

### Log Rotation

Logs are automatically rotated daily and kept for 7 days.

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose logs api
   
   # Check environment variables
   docker-compose config
   
   # Restart services
   docker-compose restart
   ```

2. **Database connection issues**
   ```bash
   # Check MongoDB container
   docker-compose logs mongodb
   
   # Test connection
   docker-compose exec api node -e "console.log(process.env.MONGO_URI)"
   ```

3. **High memory usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart containers
   docker-compose restart
   ```

### Performance Optimization

1. **Resource Limits**
   ```yaml
   # In docker-compose.yml
   services:
     api:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
   ```

2. **Database Optimization**
   - Use connection pooling
   - Implement caching (Redis)
   - Optimize database queries

## Scaling

### Horizontal Scaling

1. Use AWS Application Load Balancer
2. Deploy multiple EC2 instances
3. Use container orchestration (ECS/EKS)

### Vertical Scaling

1. Increase EC2 instance size
2. Add more memory/CPU
3. Optimize application code

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check application logs
   - Monitor resource usage
   - Review security updates

2. **Monthly**
   - Update dependencies
   - Review and rotate API keys
   - Test backup restoration

3. **Quarterly**
   - Security audit
   - Performance review
   - Disaster recovery testing

## Support

For issues and questions:
- Check application logs: `docker-compose logs -f`
- Monitor system resources: `htop`
- Review deployment logs: `/opt/chariot-api/logs/`

## Security Checklist

- [ ] Firewall configured correctly
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Access logs reviewed regularly
