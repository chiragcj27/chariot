import connectDB from "./config/database";
import SubscriptionCard from "./models/subscriptionCard.model";

const cards = [
  {
    title: "Starter",
    price: "₹ 499",
    period: "/month",
    description: "Perfect for solopreneurs & small retailers.",
    features: [
      "Access up to 50 credits/month",
      "Download select templates: flyer, reels, gift cards & more",
      "Roll over unused credits for up to 2 months",
      "Great for testing and quick wins",
    ],
    button: "GO STARTER",
  },
  {
    title: "Pro",
    price: "₹ 999",
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
  },
  {
    title: "Elite",
    price: "₹ 1,999",
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
  },
];

async function seed() {
  try {
    await connectDB();
    await SubscriptionCard.deleteMany({});
    await SubscriptionCard.insertMany(cards);
    console.log("Seeded subscription cards successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding subscription cards:", err);
    process.exit(1);
  }
}

seed(); 