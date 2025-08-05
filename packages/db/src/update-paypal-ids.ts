import connectDB from "./config/database";
import SubscriptionCard from "./models/subscriptionCard.model";

// Replace these with your actual PayPal plan IDs from the Developer Dashboard
const paypalPlanIds = {
  starter: "P-YOUR_STARTER_PLAN_ID_HERE", // Replace with real Starter plan ID
  pro: "P-YOUR_PRO_PLAN_ID_HERE", // Replace with real Pro plan ID  
  elite: "P-YOUR_ELITE_PLAN_ID_HERE", // Replace with real Elite plan ID
};

async function updatePaypalIds() {
  try {
    await connectDB();
    
    console.log("Updating PayPal plan IDs...");
    
    // Update each plan with its real PayPal plan ID
    for (const [planKey, paypalPlanId] of Object.entries(paypalPlanIds)) {
      if (paypalPlanId === `P-YOUR_${planKey.toUpperCase()}_PLAN_ID_HERE`) {
        console.log(`⚠️  Please replace the placeholder for ${planKey} plan with real PayPal plan ID`);
        continue;
      }
      
      const result = await SubscriptionCard.findOneAndUpdate(
        { planKey },
        { paypalPlanId },
        { new: true }
      );
      
      if (result) {
        console.log(`✅ Updated ${planKey} plan with PayPal ID: ${paypalPlanId}`);
      } else {
        console.log(`❌ Plan with key '${planKey}' not found`);
      }
    }
    
    // Verify the updates
    const cards = await SubscriptionCard.find({});
    console.log("\n📋 Current plans with PayPal IDs:");
    cards.forEach(card => {
      console.log(`- ${card.title} (${card.planKey}): ${card.paypalPlanId}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error updating PayPal plan IDs:", err);
    process.exit(1);
  }
}

updatePaypalIds(); 