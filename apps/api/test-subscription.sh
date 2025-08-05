#!/bin/bash

echo "🧪 Testing PayPal Subscription System"
echo "====================================="

# Test 1: Check if the endpoint exists (should return 401 for missing token)
echo -e "\n1. Testing endpoint availability..."
curl -X POST http://localhost:3001/api/subscribe/confirm \
  -H "Content-Type: application/json" \
  -d '{"paypalSubscriptionId": "I-TEST123", "planKey": "starter"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n2. Testing with invalid token..."
curl -X POST http://localhost:3001/api/subscribe/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"paypalSubscriptionId": "I-TEST123", "planKey": "starter"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n3. Testing with missing planKey..."
curl -X POST http://localhost:3001/api/subscribe/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"paypalSubscriptionId": "I-TEST123"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ Basic endpoint tests completed!"
echo -e "\n📝 Next steps:"
echo "1. Get a valid JWT token by logging in as a seller"
echo "2. Use a real PayPal subscription ID for testing"
echo "3. Test with different plan keys: starter, pro, elite" 