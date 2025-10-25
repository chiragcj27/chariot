# 🚀 Production Deployment Checklist - Chariot API on EC2

## Phase 1: Pre-Deployment Planning ✓

- [ ] **Infrastructure**
  - [ ] AWS account created and verified
  - [ ] EC2 instance type determined (t3.medium minimum)
  - [ ] OS chosen (Ubuntu 22.04 LTS recommended)
  - [ ] Region selected (check latency to users)
  - [ ] VPC and subnets planned

- [ ] **Networking & Security**
  - [ ] Security group rules defined
    - [ ] SSH (22) - restricted to your IP
    - [ ] HTTP (80) - open to 0.0.0.0/0
    - [ ] HTTPS (443) - open to 0.0.0.0/0
    - [ ] Custom TCP (3001) - for API access
  - [ ] SSH key pair created and secured
  - [ ] Firewall rules planned
  - [ ] Domain name secured (optional but recommended)

- [ ] **External Services**
  - [ ] MongoDB Atlas cluster created
  - [ ] MongoDB IP whitelist configured
  - [ ] PayPal sandbox account created
  - [ ] AWS S3 bucket created for uploads
  - [ ] AWS IAM user created for S3 access
  - [ ] SMTP service configured (Gmail or AWS SES)
  - [ ] All credentials documented (securely!)

- [ ] **Monitoring & Backups**
  - [ ] CloudWatch alerts planned
  - [ ] Backup strategy defined
  - [ ] Log aggregation approach decided
  - [ ] Disaster recovery plan created

---

## Phase 2: EC2 Instance Setup

- [ ] **Launch EC2 Instance**
  - [ ] Instance type: t3.medium
  - [ ] OS: Ubuntu 22.04 LTS
  - [ ] Root volume: 20GB gp3 minimum
  - [ ] Storage: Additional volume for data (optional)
  - [ ] Security group: Configured with above rules
  - [ ] SSH key pair: Configured and backed up
  - [ ] Public IP: Allocated (or Elastic IP if needed)

- [ ] **Initial SSH Connection**
  - [ ] SSH key has correct permissions (400)
  - [ ] Can connect to EC2 successfully
  - [ ] Update system: `sudo apt update && sudo apt upgrade -y`

- [ ] **Run Setup Script**
  - [ ] Download ec2-setup.sh script
  - [ ] Make executable: `chmod +x ec2-setup.sh`
  - [ ] Run with sudo: `sudo ./ec2-setup.sh`
  - [ ] Verify all components installed:
    - [ ] Docker running
    - [ ] Docker Compose working
    - [ ] Node.js 18 installed
    - [ ] pnpm installed
    - [ ] Git installed
    - [ ] Firewall configured

---

## Phase 3: Application Setup

- [ ] **Clone Repository**
  - [ ] Repository cloned to /opt/chariot-api
  - [ ] All files present and accessible
  - [ ] No permission issues

- [ ] **Environment Configuration**
  - [ ] .env file created (NEVER committed to git!)
  - [ ] All required variables configured:
    - [ ] NODE_ENV=production
    - [ ] PORT=3001
    - [ ] MONGO_URI set correctly (MongoDB Atlas)
    - [ ] PAYPAL_CLIENT_ID and SECRET configured
    - [ ] AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY set
    - [ ] AWS_S3_BUCKET configured
    - [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS set
    - [ ] SELLER_PORTAL_URL configured
    - [ ] JWT_SECRET and REFRESH_TOKEN_SECRET generated (strong random values)
    - [ ] HEYZINE_CLIENT_ID set (if needed)
  - [ ] File permissions set: `chmod 600 .env`
  - [ ] Verify sensitive data not in any git files

- [ ] **Database Validation**
  - [ ] MongoDB Atlas cluster accessible
  - [ ] EC2 IP added to IP whitelist
  - [ ] Test connection from EC2:
    ```bash
    docker-compose exec api node -e "
      const mongoose = require('mongoose');
      mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Connected'))
        .catch(err => console.error('❌', err.message));
    "
    ```

---

## Phase 4: Dockerfile & Docker Optimization

- [ ] **Dockerfile Review**
  - [ ] Multi-stage build implemented (builder + runtime)
  - [ ] Alpine base image used (smaller size)
  - [ ] Only production dependencies included
  - [ ] Non-root user configured
  - [ ] Health check configured
  - [ ] Environment variables optimized
  - [ ] Build layers reduced for efficiency

- [ ] **Docker Compose Configuration**
  - [ ] Build context configured correctly
  - [ ] Container names defined
  - [ ] Resource limits set:
    - [ ] API: 1 CPU limit, 1GB memory limit
    - [ ] Nginx: 0.5 CPU limit, 256MB memory limit
  - [ ] Health checks configured
  - [ ] Logging configured (json-file with rotation)
  - [ ] Nginx included for reverse proxy

---

## Phase 5: Deployment

- [ ] **Build & Deploy**
  - [ ] Navigate to /opt/chariot-api directory
  - [ ] Run: `docker-compose up --build -d`
  - [ ] Wait for containers to start (60 seconds)
  - [ ] Verify containers running: `docker ps`
  - [ ] No errors in logs: `docker-compose logs`

- [ ] **Health Check**
  - [ ] API health endpoint: `curl http://localhost:3001/api/health`
  - [ ] Response code 200 received
  - [ ] Nginx proxy working: `curl http://localhost/api/health`
  - [ ] Resource usage acceptable: `docker stats`

- [ ] **Log Verification**
  - [ ] No critical errors in logs
  - [ ] API starting successfully
  - [ ] Database connections established
  - [ ] All environment variables loaded

---

## Phase 6: Domain & SSL (Optional but Recommended)

- [ ] **Domain Configuration**
  - [ ] A record created pointing to EC2 public IP
  - [ ] DNS propagation verified
  - [ ] Domain resolves to EC2 IP

- [ ] **SSL Certificate Setup**
  - [ ] Certbot installed
  - [ ] SSL certificate obtained from Let's Encrypt
  - [ ] Certificates copied to ./ssl directory
  - [ ] Nginx restarted: `docker-compose restart nginx`
  - [ ] HTTPS connection verified: `curl https://yourdomain.com/api/health`

---

## Phase 7: Security Hardening

- [ ] **Firewall Configuration**
  - [ ] Firewall status verified: `sudo firewall-cmd --list-all`
  - [ ] Only necessary ports open
  - [ ] SSH restricted to authorized IPs (optional)

- [ ] **SSH Security**
  - [ ] SSH key backup created
  - [ ] Password authentication disabled (optional)
  - [ ] SSH configured to non-standard port (optional)

- [ ] **Credentials Security**
  - [ ] .env file permissions: 600
  - [ ] .env not in git repository
  - [ ] Credentials not logged anywhere
  - [ ] Rotation schedule established (every 90 days)

- [ ] **Monitoring & Alerts**
  - [ ] CloudWatch agent configured
  - [ ] Alarms created for:
    - [ ] High CPU usage
    - [ ] High memory usage
    - [ ] Disk space running low
    - [ ] API health check failures

---

## Phase 8: Backup & Recovery

- [ ] **Backup Configuration**
  - [ ] Backup script location: /opt/chariot-api/backup.sh
  - [ ] Manual backup test: `/opt/chariot-api/backup.sh`
  - [ ] Backups verified: `ls -la /opt/chariot-api/backups/`
  - [ ] Cron job configured: `crontab -l`
  - [ ] Daily backups scheduled at 2 AM
  - [ ] Backup retention policy set (7 days)

- [ ] **Disaster Recovery Plan**
  - [ ] Recovery procedure documented
  - [ ] Restore process tested
  - [ ] Time to restore estimated
  - [ ] Team trained on recovery steps

---

## Phase 9: Monitoring & Logging

- [ ] **Monitoring Setup**
  - [ ] Monitor script created: /opt/chariot-api/monitor.sh
  - [ ] Manual monitoring test: `/opt/chariot-api/monitor.sh`
  - [ ] Cron job for monitoring: Every 5 minutes
  - [ ] Resource usage baseline established

- [ ] **Log Configuration**
  - [ ] Container logs configured (json-file)
  - [ ] Log rotation configured (10MB max, 3 files)
  - [ ] System logs monitored
  - [ ] Log aggregation planned (CloudWatch or similar)

- [ ] **Alerting**
  - [ ] Alert thresholds established
  - [ ] Notification channels configured
  - [ ] On-call schedule documented
  - [ ] Incident response plan created

---

## Phase 10: Post-Deployment Verification

- [ ] **Application Testing**
  - [ ] API endpoints responding correctly
  - [ ] Database queries working
  - [ ] File uploads functioning (S3)
  - [ ] Email sending working
  - [ ] PayPal integration working (sandbox)
  - [ ] Authentication working
  - [ ] Load tested with expected traffic

- [ ] **Performance Baseline**
  - [ ] Response times noted
  - [ ] CPU/Memory usage during normal load
  - [ ] Database query performance
  - [ ] Disk I/O acceptable

- [ ] **Security Verification**
  - [ ] SSL certificate valid
  - [ ] CORS properly configured
  - [ ] Security headers in responses
  - [ ] No sensitive data in logs
  - [ ] Rate limiting working (if configured)

- [ ] **Documentation**
  - [ ] Deployment steps documented
  - [ ] Architecture diagram created
  - [ ] API endpoints documented
  - [ ] Team trained on operations
  - [ ] Emergency contacts documented
  - [ ] Runbooks created

---

## Phase 11: Production Operations

- [ ] **Daily Operations**
  - [ ] Health checks performed
  - [ ] Logs reviewed for errors
  - [ ] Backups verified
  - [ ] Resource usage monitored

- [ ] **Weekly Tasks**
  - [ ] Detailed log analysis
  - [ ] Performance review
  - [ ] Security updates reviewed
  - [ ] Backup restoration tested

- [ ] **Monthly Tasks**
  - [ ] Dependency updates planned
  - [ ] Credentials reviewed and rotated if needed
  - [ ] Disaster recovery drill
  - [ ] Security audit

- [ ] **Quarterly Tasks**
  - [ ] Full security audit
  - [ ] Performance optimization review
  - [ ] Architecture review
  - [ ] Capacity planning

---

## Phase 12: Scaling & Future Improvements

- [ ] **Horizontal Scaling Planning**
  - [ ] Load balancer configuration planned
  - [ ] Multi-instance deployment strategy
  - [ ] State management approach decided
  - [ ] Session sharing strategy

- [ ] **Performance Optimization**
  - [ ] Caching strategy (Redis if needed)
  - [ ] Database query optimization
  - [ ] Image optimization
  - [ ] CDN setup (optional)

- [ ] **Infrastructure as Code**
  - [ ] Terraform/CloudFormation templates created
  - [ ] Automation scripts developed
  - [ ] CI/CD pipeline configured
  - [ ] Automated deployments tested

---

## Quick Reference - Essential Commands

```bash
# Deployment
cd /opt/chariot-api
docker-compose up --build -d

# Health checks
curl http://localhost:3001/api/health
/opt/chariot-api/monitor.sh

# Logs
docker-compose logs -f api
docker-compose logs api --tail=100

# Management
docker-compose restart
docker-compose down
docker stats --no-stream

# Backups
/opt/chariot-api/backup.sh
ls -la /opt/chariot-api/backups/

# Updates
git pull origin main
docker-compose up --build -d
```

---

## Emergency Contact Information

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | [Name] | [Email/Phone] |
| Backend Lead | [Name] | [Email/Phone] |
| On-Call | [Name] | [Email/Phone] |

---

## Notes & Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Special Notes:**
_________________________________________________________________

_________________________________________________________________

**Sign-Off:**
- [ ] All checks completed
- [ ] Application stable
- [ ] Ready for production traffic
- [ ] Documentation complete

**Signature:** ______________________ **Date:** ______________ 