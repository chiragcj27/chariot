# PayPal Subscription Production Setup Guide

This guide will help you set up PayPal subscriptions for production deployment.

## Prerequisites

1. PayPal Business Account
2. Production PayPal App credentials
3. Domain with SSL certificate
4. Environment variables configured

## Step 1: Environment Variables

Add these environment variables to your production server:

### Backend (API) Environment Variables
```bash
# PayPal API Credentials
PAYPAL_CLIENT_ID=your_production_paypal_client_id
PAYPAL_CLIENT_SECRET=your_production_paypal_client_secret
PAYPAL_API_BASE=https://api-m.paypal.com

# PayPal Webhook (will be set after webhook creation)
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook

# Other required variables
NODE_ENV=production
```

### Frontend (Website) Environment Variables
```bash
# PayPal Client ID (public)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_paypal_client_id
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Step 2: Create PayPal Plans

Run the PayPal plan creation script to create subscription plans in PayPal:

```bash
cd packages/db
NODE_ENV=production pnpm tsx src/create-paypal-plans.ts
```

This will:
- Create products in PayPal for each subscription tier
- Create billing plans for each product
- Update your database with real PayPal plan IDs

**Note:** You only need to run this once. The plans will persist in PayPal.

## Step 3: Create PayPal Webhook

Run the webhook creation script:

```bash
cd packages/db
NODE_ENV=production PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook pnpm tsx src/create-paypal-webhook.ts
```

This will:
- Create a webhook in PayPal pointing to your API
- Configure webhook to listen for subscription events
- Provide you with the webhook ID to add to environment variables

## Step 4: Update Database with Real Plan IDs

After creating PayPal plans, update your subscription cards:

```bash
cd packages/db
pnpm tsx src/seed-subscription-cards.ts
```

## Step 5: Test the Integration

### Test Subscription Flow
```bash
cd apps/api
./test-complete-subscription.sh
```

### Test Webhooks
```bash
cd apps/api
./test-webhooks.sh
```

## Step 6: Production Deployment Checklist

- [ ] Environment variables configured
- [ ] PayPal plans created and database updated
- [ ] Webhook created and configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Frontend deployed with correct environment variables
- [ ] Backend deployed with correct environment variables
- [ ] Database migrations run
- [ ] Subscription flow tested
- [ ] Webhook events tested

## Step 7: Monitoring and Maintenance

### Monitor Webhook Events
Check your server logs for webhook events:
- `BILLING.SUBSCRIPTION.PAYMENT.COMPLETED` - Successful payments
- `BILLING.SUBSCRIPTION.CANCELLED` - Cancelled subscriptions
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED` - Failed payments

### PayPal Dashboard
- Monitor subscriptions in PayPal dashboard
- Check webhook delivery status
- Review payment history

### Error Handling
The system includes comprehensive error handling:
- Webhook signature verification
- Subscription status tracking
- Payment failure notifications
- Automatic credit management

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook signature verification
   - Check PayPal dashboard for webhook status

2. **Subscription creation fails**
   - Verify PayPal plan IDs are correct
   - Check PayPal API credentials
   - Ensure user is authenticated

3. **Credits not added**
   - Check webhook is receiving payment events
   - Verify subscription status in database
   - Check user authentication

### Debug Commands

```bash
# Check PayPal plan status
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api-m.paypal.com/v1/billing/plans

# Check webhook status
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api-m.paypal.com/v1/notifications/webhooks

# Test webhook manually
curl -X POST https://your-domain.com/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures in production
2. **HTTPS**: Use HTTPS for all webhook URLs
3. **Environment Variables**: Keep PayPal credentials secure
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Logging**: Log all webhook events for debugging

## Support

For PayPal-specific issues:
- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Support](https://www.paypal.com/support/)

For application-specific issues:
- Check server logs
- Review webhook event history
- Test with PayPal sandbox first 