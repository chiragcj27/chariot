# Production Deployment Checklist

## 🚀 Quick Production Setup

### 1. Environment Variables
```bash
# Backend (.env)
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook
NODE_ENV=production

# Frontend (.env.local)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 2. Create PayPal Plans
```bash
cd packages/db
NODE_ENV=production pnpm create-plans
```

### 3. Create Webhook
```bash
cd packages/db
NODE_ENV=production PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook pnpm create-webhook
```

### 4. Deploy
```bash
# Deploy backend with production env vars
# Deploy frontend with production env vars
# Ensure HTTPS is enabled
```

### 5. Test
```bash
# Test with real PayPal account ($4.99)
# Verify webhook events
# Check subscription management
```

## ✅ Pre-Deployment Checklist

- [ ] PayPal production credentials obtained
- [ ] Domain with HTTPS configured
- [ ] Database production connection set
- [ ] Environment variables configured
- [ ] PayPal plans created
- [ ] Webhook configured
- [ ] SSL certificates installed
- [ ] DNS settings updated

## ✅ Post-Deployment Checklist

- [ ] PayPal button renders correctly
- [ ] Payment flow works end-to-end
- [ ] Credits are added after payment
- [ ] Webhook events are received
- [ ] Subscription appears in PayPal dashboard
- [ ] Error handling works
- [ ] Success messages display correctly

## 🔧 Quick Commands

```bash
# Check environment
cd packages/db && pnpm check-env

# Test subscription flow
cd apps/api && ./test-complete-subscription.sh

# Monitor webhooks
tail -f /var/log/app/webhook.log

# Check PayPal plans
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api-m.paypal.com/v1/billing/plans
```

## 🆘 Emergency Contacts

- **PayPal Support**: https://www.paypal.com/support/
- **PayPal Developer Docs**: https://developer.paypal.com/
- **Application Logs**: Check server logs for errors
- **Database**: Verify subscription data integrity

---

*Keep this checklist handy for quick reference during deployment!* 