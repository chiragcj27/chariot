import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || (process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');
const WEBHOOK_URL = process.env.PAYPAL_WEBHOOK_URL;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error('PayPal credentials are not set in environment variables');
}

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
    }
  );
  return response.data.access_token;
}

async function createWebhook(accessToken: string) {
  if (!WEBHOOK_URL) {
    throw new Error('PAYPAL_WEBHOOK_URL environment variable is required');
  }

  const webhookData = {
    url: WEBHOOK_URL,
    event_types: [
      {
        name: 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.CANCELLED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.ACTIVATED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.SUSPENDED'
      }
    ]
  };

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/webhooks`,
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      console.log('⚠️  Webhook already exists, fetching existing webhooks...');
      return await listWebhooks(accessToken);
    }
    throw error;
  }
}

async function listWebhooks(accessToken: string) {
  const response = await axios.get(
    `${PAYPAL_API_BASE}/v1/notifications/webhooks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

async function deleteWebhook(accessToken: string, webhookId: string) {
  await axios.delete(
    `${PAYPAL_API_BASE}/v1/notifications/webhooks/${webhookId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

async function createPayPalWebhook() {
  try {
    console.log('🔧 Setting up PayPal webhook...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (!WEBHOOK_URL) {
      console.log('\n❌ PAYPAL_WEBHOOK_URL is not set!');
      console.log('\n📝 For development, you have several options:');
      console.log('\n1. Use webhook.site (recommended for testing):');
      console.log('   - Go to https://webhook.site');
      console.log('   - Copy your unique URL');
      console.log('   - Run: PAYPAL_WEBHOOK_URL=https://webhook.site/your-url pnpm create-webhook');
      console.log('\n2. Use ngrok to expose your local server:');
      console.log('   - Install ngrok: npm install -g ngrok');
      console.log('   - Start your API server: pnpm dev');
      console.log('   - In another terminal: ngrok http 3001');
      console.log('   - Copy the HTTPS URL and run: PAYPAL_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/subscribe/webhook pnpm create-webhook');
      console.log('\n3. Skip webhook for development (subscriptions will still work):');
      console.log('   - Just test the subscription flow without webhooks');
      console.log('   - Webhooks are mainly for handling renewals and cancellations');
      console.log('\n4. For production:');
      console.log('   - Set PAYPAL_WEBHOOK_URL=https://your-domain.com/api/subscribe/webhook');
      console.log('   - Run: NODE_ENV=production pnpm create-webhook');
      
      process.exit(1);
    }
    
    console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
    
    const accessToken = await getAccessToken();
    console.log('✅ Got access token');
    
    // Create webhook
    const webhook = await createWebhook(accessToken);
    
    if (webhook.webhooks && webhook.webhooks.length > 0) {
      console.log('\n📋 Existing webhooks:');
      webhook.webhooks.forEach((hook: any) => {
        console.log(`- ID: ${hook.id}`);
        console.log(`  URL: ${hook.url}`);
        console.log(`  Status: ${hook.status}`);
        console.log(`  Event Types: ${hook.event_types.map((et: any) => et.name).join(', ')}`);
        console.log('');
      });
    } else {
      console.log('\n✅ Webhook created successfully:');
      console.log(`- ID: ${webhook.id}`);
      console.log(`- URL: ${webhook.url}`);
      console.log(`- Status: ${webhook.status}`);
    }
    
    console.log('\n🎉 Webhook setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add these environment variables to your production server:');
    console.log(`   PAYPAL_WEBHOOK_ID=${webhook.id || webhook.webhooks?.[0]?.id || 'YOUR_WEBHOOK_ID'}`);
    console.log('   PAYPAL_WEBHOOK_SECRET=your_webhook_secret');
    console.log('2. Update your webhook URL in PayPal dashboard if needed');
    console.log('3. Test the webhook using the test script');
    
    process.exit(0);
  } catch (error: unknown) {
    console.error('❌ Error creating PayPal webhook:', error);
    if (axios.isAxiosError(error)) {
      console.error('PayPal API Error:', error.response?.data);
      
      if (error.response?.status === 400) {
        console.log('\n💡 Common fixes:');
        console.log('- Make sure the webhook URL is HTTPS (not HTTP)');
        console.log('- Ensure the URL is publicly accessible');
        console.log('- Check that the URL returns a 200 status code');
      }
    }
    process.exit(1);
  }
}

createPayPalWebhook(); 