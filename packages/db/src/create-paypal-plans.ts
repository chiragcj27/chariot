import connectDB from "./config/database";
import SubscriptionCard from "./models/subscriptionCard.model";
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || (process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');

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

async function createPayPalProduct(accessToken: string, productData: any) {
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/catalogs/products`,
    productData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

async function createPayPalPlan(accessToken: string, planData: any) {
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/billing/plans`,
    planData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

const plans = [
  {
    name: "Chariot Starter Plan",
    description: "Perfect for solopreneurs & small retailers",
    price: 499,
    planKey: "starter",
    credits: 50
  },
  {
    name: "Chariot Pro Plan", 
    description: "For growing brands that post consistently",
    price: 999,
    planKey: "pro",
    credits: 200
  },
  {
    name: "Chariot Elite Plan",
    description: "Agency-grade access. Maximum value.",
    price: 1999,
    planKey: "elite", 
    credits: 999999
  }
];

async function createPayPalPlans() {
  try {
    await connectDB();
    const accessToken = await getAccessToken();
    
    console.log("Creating PayPal products and plans...");
    
    for (const plan of plans) {
      console.log(`\nCreating ${plan.name}...`);
      
      // 1. Create Product
      const productData = {
        name: plan.name,
        description: plan.description,
        type: "SERVICE",
        category: "SOFTWARE",
        image_url: "https://example.com/logo.png", // Optional
        home_url: "https://yourwebsite.com" // Optional
      };
      
      const product = await createPayPalProduct(accessToken, productData);
      console.log(`✅ Created product: ${product.id}`);
      
      // 2. Create Plan
      const planData = {
        product_id: product.id,
        name: `${plan.name} - Monthly`,
        description: plan.description,
        type: "FIXED",
        billing_cycles: [
          {
            frequency: {
              interval_unit: "MONTH",
              interval_count: 1
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: plan.price.toString(),
                currency_code: "USD"
              }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD"
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3
        }
      };
      
      const paypalPlan = await createPayPalPlan(accessToken, planData);
      console.log(`✅ Created plan: ${paypalPlan.id}`);
      
      // 3. Update database with real PayPal plan ID
      await SubscriptionCard.findOneAndUpdate(
        { planKey: plan.planKey },
        { paypalPlanId: paypalPlan.id }
      );
      
      console.log(`✅ Updated database for ${plan.planKey} with PayPal plan ID: ${paypalPlan.id}`);
    }
    
    // Verify all plans
    const cards = await SubscriptionCard.find({});
    console.log("\n📋 Final plans with PayPal IDs:");
    cards.forEach(card => {
      console.log(`- ${card.title} (${card.planKey}): ${card.paypalPlanId}`);
    });
    
    console.log("\n🎉 All PayPal plans created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating PayPal plans:", error);
    if (axios.isAxiosError(error)) {
      console.error("PayPal API Error:", error.response?.data);
    }
    process.exit(1);
  }
}

createPayPalPlans(); 