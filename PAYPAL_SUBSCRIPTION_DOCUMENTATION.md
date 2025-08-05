# PayPal Subscription System Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Production Setup](#production-setup)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## 🏗️ System Overview

The PayPal subscription system allows users to subscribe to different credit plans using PayPal's subscription API. Users can pay with credit cards, PayPal balance, or other payment methods through PayPal's secure payment portal.

### Key Features
- ✅ Real-time PayPal payment processing
- ✅ Automatic credit management
- ✅ Subscription lifecycle tracking
- ✅ Webhook-based renewals
- ✅ Multi-plan support (Starter, Pro, Elite)
- ✅ Secure payment handling

### Supported Plans
| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Starter | $4.99/month | 50 credits | Basic access |
| Pro | $9.99/month | 200 credits | Premium access |
| Elite | $19.99/month | Unlimited | Full access |

---

## 🏛️ Architecture

### Frontend Components
```
SubscriptionCards.tsx → SubscriptionCheckout.tsx → PayPal Button → PayPal Portal
```

### Backend Flow
```
PayPal Webhook → Webhook Controller → Subscription Controller → Database
```

### Database Models
- **UserSubscription**: Tracks user subscriptions
- **SubscriptionCard**: Defines available plans
- **User**: Stores user credits and info

### Key Files
```
apps/website/src/
├── components/
│   ├── SubscriptionCards.tsx      # Plan selection UI
│   └── SubscriptionCheckout.tsx   # Checkout modal
├── lib/
│   └── paypal.ts                  # PayPal SDK integration
└── contexts/
    └── AuthContext.tsx            # User credit management

apps/api/src/
├── controllers/
│   ├── subscription.controller.ts # Subscription logic
│   └── webhook.controller.ts      # PayPal webhook handling
├── services/
│   └── paypal.service.ts          # PayPal API calls
└── routes/
    └── subscription.routes.ts     # API endpoints

packages/db/src/
├── models/
│   ├── userSubscription.model.ts  # Subscription schema
│   └── subscriptionCard.model.ts  # Plan schema
└── scripts/
    ├── create-paypal-plans.ts     # Plan creation
    └── create-paypal-webhook.ts   # Webhook setup
```

---

## 🛠️ Development Setup

### 1. Environment Variables

Create `.env` in the root directory:

```bash
# Backend (API)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# Frontend (Website)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database
MONGO_URI=your_mongodb_connection_string
```

### 2. Create PayPal Plans (One-time)

```bash
cd packages/db
pnpm create-plans
```

This creates:
- PayPal products for each plan
- Billing plans with monthly subscriptions
- Updates database with real PayPal plan IDs

### 3. Start Development Servers

```bash
# Terminal 1: Start backend
pnpm dev

# Terminal 2: Start frontend
cd apps/website
pnpm dev
```

### 4. Test the System

```bash
# Test subscription flow
cd apps/api
./test-complete-subscription.sh

# Test webhooks (optional)
./test-webhooks.sh
```

---

## 🚀 Production Setup

### 1. Environment Variables (Production)

```bash
# Backend
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook

# Frontend
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_API_URL=https://your-domain.com

# Other
NODE_ENV=production
```

### 2. Create Production PayPal Plans

```bash
cd packages/db
NODE_ENV=production pnpm create-plans
```

### 3. Create Production Webhook

```bash
cd packages/db
NODE_ENV=production PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook pnpm create-webhook
```

### 4. Deploy Application

```bash
# Deploy backend
# Deploy frontend
# Ensure HTTPS is enabled
# Update DNS settings
```

### 5. Verify Production Setup

```bash
# Test with real PayPal account (small amount)
# Verify webhook events are received
# Check subscription management in PayPal dashboard
```

---

## 🧪 Testing

### Development Testing

#### 1. Mock Subscription Testing
```bash
# Test without real PayPal
cd apps/api
./test-complete-subscription.sh
```

#### 2. PayPal Sandbox Testing
- Use PayPal sandbox test accounts
- Test with fake credit cards
- Verify complete payment flow

#### 3. Frontend Testing
- Test subscription button rendering
- Test checkout modal
- Test success/error states

### Production Testing

#### 1. Real Payment Testing
- Use real PayPal account
- Test with small amounts ($4.99)
- Cancel subscription immediately after testing

#### 2. Webhook Testing
- Monitor webhook events in logs
- Test subscription renewals
- Test payment failures

#### 3. Error Handling Testing
- Test with invalid payment methods
- Test with insufficient funds
- Test network failures

---

## 🔧 Troubleshooting

### Common Issues

#### 1. PayPal Button Not Rendering
**Symptoms:** No PayPal button appears in checkout
**Solutions:**
- Check browser console for errors
- Verify PayPal client ID is set
- Check if PayPal SDK loaded successfully
- Ensure subscription cards have valid PayPal plan IDs

#### 2. Payment Fails
**Symptoms:** Payment fails with error
**Solutions:**
- Check PayPal sandbox/production environment
- Verify plan IDs are correct
- Check webhook configuration
- Review PayPal dashboard for errors

#### 3. Credits Not Added
**Symptoms:** Payment succeeds but credits not added
**Solutions:**
- Check subscription confirmation endpoint
- Verify database connection
- Check user authentication
- Review webhook event handling

#### 4. Webhook Not Receiving Events
**Symptoms:** No webhook events in logs
**Solutions:**
- Verify webhook URL is accessible
- Check webhook signature verification
- Ensure HTTPS is enabled
- Check PayPal webhook configuration

### Debug Commands

```bash
# Check environment variables
cd packages/db
pnpm check-env

# Test PayPal API connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api-m.paypal.com/v1/billing/plans

# Test webhook endpoint
curl -X POST https://your-domain.com/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check subscription status
curl -H "Authorization: Bearer USER_TOKEN" \
  https://your-domain.com/api/subscribe/status
```

---

## 🔄 Maintenance

### Daily Monitoring

#### 1. Check Webhook Events
```bash
# Monitor webhook logs
tail -f /var/log/app/webhook.log

# Look for:
# - BILLING.SUBSCRIPTION.PAYMENT.COMPLETED
# - BILLING.SUBSCRIPTION.CANCELLED
# - BILLING.SUBSCRIPTION.PAYMENT.FAILED
```

#### 2. Monitor Subscription Status
- Check active subscriptions in database
- Monitor credit balances
- Track payment failures

#### 3. PayPal Dashboard Monitoring
- Review subscription status
- Check webhook delivery status
- Monitor payment history

### Monthly Tasks

#### 1. Review Subscription Analytics
- Track subscription growth
- Monitor churn rate
- Analyze payment success rates

#### 2. Update Plans (if needed)
```bash
# Create new plans
cd packages/db
NODE_ENV=production pnpm create-plans

# Update existing plans in PayPal dashboard
```

#### 3. Security Review
- Rotate PayPal credentials
- Review webhook security
- Update SSL certificates

### Quarterly Tasks

#### 1. Performance Review
- Monitor API response times
- Check database performance
- Review error rates

#### 2. Feature Updates
- Review PayPal API updates
- Implement new features
- Update documentation

---

## 📞 Support

### PayPal Support
- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Support](https://www.paypal.com/support/)
- [PayPal Developer Community](https://developer.paypal.com/community/)

### Internal Support
- Check application logs
- Review webhook event history
- Test with PayPal sandbox first

### Emergency Procedures

#### 1. Payment System Down
- Disable subscription buttons
- Notify users of maintenance
- Check PayPal API status

#### 2. Webhook Failures
- Check webhook configuration
- Verify server accessibility
- Review PayPal webhook status

#### 3. Database Issues
- Check database connectivity
- Review subscription data integrity
- Restore from backup if needed

---

## 📝 Change Log

### Version 1.0.0 (Current)
- ✅ PayPal subscription integration
- ✅ Credit management system
- ✅ Webhook handling
- ✅ Multi-plan support
- ✅ Production deployment ready

### Future Enhancements
- [ ] Subscription management UI
- [ ] Payment failure notifications
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Subscription upgrades/downgrades

---

## 🔐 Security Notes

### Data Protection
- All payment data handled by PayPal
- No credit card data stored locally
- Webhook signature verification enabled
- HTTPS required for all endpoints

### Access Control
- PayPal credentials stored securely
- Webhook secrets protected
- Database access restricted
- API rate limiting enabled

---

*Last updated: August 2025*
*Version: 1.0.0* 