import connectDB from "./config/database";
import SubscriptionCard from "./models/subscriptionCard.model";

// Migration data with new fields
const migrationData = [
  {
    title: "Starter",
    price: 499, // Convert to number
    period: "/month",
    description: "Perfect for solopreneurs & small retailers.",
    features: [
      "Access up to 50 credits/month",
      "Download select templates: flyer, reels, gift cards & more",
      "Roll over unused credits for up to 2 months",
      "Great for testing and quick wins",
    ],
    button: "GO STARTER",
    // New fields
    paypalPlanId: "P-5ML4271244454362XMQIZHI", // Replace with your actual PayPal plan ID
    credits: 50,
    planKey: "starter",
  },
  {
    title: "Pro",
    price: 999, // Convert to number
    period: "/month",
    description: "For growing brands that post consistantly",
    features: [
      "Get 200 credits/month",
      "Unlock premium packs & seasonal kits",
      "Access top-performing assets for reels, email, catalogs & campaigns",
      "Priority chat support",
      "Ideal for D2C brands, Instagram sellers, or multi-outlet stores",
    ],
    button: "GO PRO",
    // New fields
    paypalPlanId: "P-5ML4271244454362XMQIZHI", // Replace with your actual PayPal plan ID
    credits: 200,
    planKey: "pro",
  },
  {
    title: "Elite",
    price: 1999, // Convert to number
    period: "/month",
    description: "Agency-grade access. Maximum value.",
    features: [
      "Unlimited downloads & access",
      "Free access to future AI tools (caption generator, voiceover assistant, etc.)",
      "Early access to influencer marketplace",
      "Monthly trend insights & recommendations",
      "Best for large brands, agencies, and marketing teams",
    ],
    button: "GO ELITE",
    // New fields
    paypalPlanId: "P-5ML4271244454362XMQIZHI", // Replace with your actual PayPal plan ID
    credits: 999999, // Unlimited (represented as large number)
    planKey: "elite",
  },
];

async function migrate() {
  try {
    await connectDB();
    
    console.log("Starting subscription cards migration...");
    
    // Delete existing cards
    await SubscriptionCard.deleteMany({});
    console.log("Deleted existing subscription cards.");
    
    // Insert new cards with updated schema
    await SubscriptionCard.insertMany(migrationData);
    console.log("Migrated subscription cards successfully with new schema.");
    
    // Verify the migration
    const cards = await SubscriptionCard.find({});
    console.log(`Found ${cards.length} subscription cards:`);
    cards.forEach(card => {
      console.log(`- ${card.title}: ${card.price} credits, planKey: ${card.planKey}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error migrating subscription cards:", err);
    process.exit(1);
  }
}

migrate(); 