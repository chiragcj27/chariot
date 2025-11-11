import connectDB from "./config/database";
import SubscriptionCard from "./models/subscriptionCard.model";

const cards = [
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

async function seed() {
  try {
    await connectDB();
    console.log("Seeding subscription cards...");
    
    // First, fix any existing duplicate placeholder IDs
    const placeholderId = "P-5ML4271244454362XMQIZHI";
    const cardsWithPlaceholder = await SubscriptionCard.find({ 
      paypalPlanId: placeholderId 
    });
    
    if (cardsWithPlaceholder.length > 1) {
      console.log(`⚠️  Found ${cardsWithPlaceholder.length} cards with duplicate placeholder ID. Fixing...`);
      // Keep the first one, update the rest with unique placeholders
      for (let i = 1; i < cardsWithPlaceholder.length; i++) {
        const card = cardsWithPlaceholder[i];
        await SubscriptionCard.findOneAndUpdate(
          { _id: card._id },
          { paypalPlanId: `PLACEHOLDER-${card.planKey.toUpperCase()}` }
        );
        console.log(`✅ Fixed duplicate for ${card.planKey}`);
      }
    }
    
    // Use upsert to update existing cards or create new ones
    for (const card of cards) {
      const existingCard = await SubscriptionCard.findOne({ planKey: card.planKey });
      
      if (existingCard) {
        // Card exists - update all fields, but preserve paypalPlanId if it's not a placeholder
        const updateData: any = {
          title: card.title,
          price: card.price,
          period: card.period,
          description: card.description,
          features: card.features,
          button: card.button,
          credits: card.credits,
        };
        
        // Only update paypalPlanId if existing one is the placeholder
        // This preserves real PayPal plan IDs that were set by create-paypal-plans.ts
        if (existingCard.paypalPlanId === "P-5ML4271244454362XMQIZHI" || 
            existingCard.paypalPlanId?.startsWith("PLACEHOLDER-")) {
          // Check if another card already has this placeholder ID
          const cardWithSamePlanId = await SubscriptionCard.findOne({ 
            paypalPlanId: card.paypalPlanId,
            planKey: { $ne: card.planKey }
          });
          
          if (cardWithSamePlanId) {
            // Another card has this placeholder, use a unique placeholder for this card
            updateData.paypalPlanId = `PLACEHOLDER-${card.planKey.toUpperCase()}`;
            console.log(`⚠️  Using unique placeholder for ${card.planKey} to avoid duplicate`);
          } else {
            updateData.paypalPlanId = card.paypalPlanId;
          }
        }
        // Otherwise, keep the existing paypalPlanId (real one from create-paypal-plans.ts)
        
        await SubscriptionCard.findOneAndUpdate(
          { planKey: card.planKey },
          updateData,
          { runValidators: true, new: true }
        );
        console.log(`✅ Updated: ${card.title} (${card.planKey})`);
      } else {
        // Card doesn't exist - create it
        const cardToCreate = { ...card };
        
        // If using placeholder, always use a unique one per planKey to avoid conflicts
        if (card.paypalPlanId === "P-5ML4271244454362XMQIZHI") {
          // Check if any card already has this exact placeholder
          const cardWithSamePlanId = await SubscriptionCard.findOne({ 
            paypalPlanId: card.paypalPlanId 
          });
          
          if (cardWithSamePlanId) {
            // Another card has this placeholder, use unique placeholder for this card
            cardToCreate.paypalPlanId = `PLACEHOLDER-${card.planKey.toUpperCase()}`;
            console.log(`⚠️  Using unique placeholder for ${card.planKey} to avoid duplicate`);
          }
          // If no card has it, this is the first one, so we can use the placeholder
        }
        
        await SubscriptionCard.create(cardToCreate);
        console.log(`✅ Created: ${card.title} (${card.planKey})`);
      }
    }
    
    // Display all cards
    const allCards = await SubscriptionCard.find({});
    console.log("\n📋 Current subscription cards:");
    allCards.forEach(card => {
      const planIdDisplay = card.paypalPlanId?.startsWith("PLACEHOLDER-") 
        ? `${card.paypalPlanId} (will be updated by create-paypal-plans.ts)`
        : card.paypalPlanId || 'NOT SET';
      console.log(`- ${card.title} (${card.planKey}): PayPal Plan ID = ${planIdDisplay}`);
    });
    
    console.log("\n✅ Seeded subscription cards successfully.");
    console.log("\n💡 Next step: Run 'pnpm create-plans' to update PayPal plan IDs with real values from PayPal.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding subscription cards:", err);
    process.exit(1);
  }
}

seed(); 