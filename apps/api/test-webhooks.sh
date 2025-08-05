#!/bin/bash

echo "🔗 Testing PayPal Webhooks"
echo "=========================="

# Test webhook endpoint availability
echo -e "\n1. Testing webhook endpoint availability..."
curl -X POST http://localhost:3001/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}' \
  -w "\nStatus: %{http_code}\n"

# Test subscription payment completed webhook
echo -e "\n2. Testing subscription payment completed webhook..."
curl -X POST http://localhost:3001/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-2JR7241HC0233512X-67976317FL4543714",
    "event_type": "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED",
    "create_time": "2023-07-30T06:00:00.000Z",
    "resource_type": "subscription",
    "resource": {
      "id": "I-TEST123456789",
      "status": "ACTIVE",
      "start_time": "2023-07-30T06:00:00.000Z",
      "billing_info": {
        "next_billing_time": "2023-08-30T06:00:00.000Z"
      }
    }
  }' \
  -w "\nStatus: %{http_code}\n"

# Test subscription cancelled webhook
echo -e "\n3. Testing subscription cancelled webhook..."
curl -X POST http://localhost:3001/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-2JR7241HC0233512X-67976317FL4543715",
    "event_type": "BILLING.SUBSCRIPTION.CANCELLED",
    "create_time": "2023-07-30T06:00:00.000Z",
    "resource_type": "subscription",
    "resource": {
      "id": "I-TEST123456789",
      "status": "CANCELLED",
      "update_time": "2023-07-30T06:00:00.000Z"
    }
  }' \
  -w "\nStatus: %{http_code}\n"

# Test payment failed webhook
echo -e "\n4. Testing payment failed webhook..."
curl -X POST http://localhost:3001/api/subscribe/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-2JR7241HC0233512X-67976317FL4543716",
    "event_type": "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
    "create_time": "2023-07-30T06:00:00.000Z",
    "resource_type": "subscription",
    "resource": {
      "id": "I-TEST123456789",
      "status": "PAST_DUE"
    }
  }' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ Webhook tests completed!"
echo -e "\n📝 Notes:"
echo "- All webhooks should return 200 status"
echo "- Check your server logs for webhook processing"
echo "- Verify database updates for subscription status changes" 