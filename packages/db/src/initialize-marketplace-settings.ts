import connectDB from './config/database';
import { MarketplaceSettings } from './models/marketplaceSettings.model';

async function initializeMarketplaceSettings() {
  try {
    await connectDB();
    
    // Check if settings already exist
    const existingSettings = await MarketplaceSettings.findOne();
    
    if (!existingSettings) {
      // Create default marketplace settings
      const defaultSettings = new MarketplaceSettings({
        defaultCommissionRate: 5.0, // 5% default commission
        commissionRates: {}, // Empty map for individual seller rates
        defaultTaxRate: 12.5, // 12.5% default tax
        taxRates: {}, // Empty map for category-specific rates
        emailNotifications: true,
        smsNotifications: false,
        minimumPayoutAmount: 100, // $100 minimum payout
        payoutSchedule: 'monthly',
        currency: 'USD',
        siteName: 'Chariot Marketplace',
        contactEmail: 'support@chariot.com',
      });
      
      await defaultSettings.save();
      console.log('✅ Default marketplace settings created successfully');
    } else {
      console.log('ℹ️ Marketplace settings already exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing marketplace settings:', error);
    process.exit(1);
  }
}

initializeMarketplaceSettings();
