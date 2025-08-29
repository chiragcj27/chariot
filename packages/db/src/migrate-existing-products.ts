import connectDB from './config/database';
import { Product } from './models/product.model';
import { User } from './models/user.model';

// Simple slug creation function
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function migrateExistingProducts() {
  try {
    await connectDB();
    
    console.log('🔍 Finding products without SKU or sellerId...');
    
    // Find products that are missing SKU or sellerId
    const productsToMigrate = await Product.find({
      $or: [
        { sku: { $exists: false } },
        { sku: null },
        { sku: '' },
        { sellerId: { $exists: false } },
        { sellerId: null }
      ]
    });
    
    console.log(`📦 Found ${productsToMigrate.length} products that need migration`);
    
    if (productsToMigrate.length === 0) {
      console.log('✅ All products already have SKU and sellerId fields');
      process.exit(0);
    }
    
    // Get the first admin user to assign as seller for existing products
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    console.log(`👤 Using admin user (${adminUser.name}) as seller for existing products`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const product of productsToMigrate) {
      try {
        const updates: any = {};
        
        // Generate SKU if missing
        if (!product.sku || product.sku === '') {
          const baseSku = createSlug(product.name).toUpperCase().replace(/[^A-Z0-9]/g, '');
          let sku = baseSku;
          let counter = 1;
          
          // Ensure SKU is unique
          while (true) {
            const existingProduct = await Product.findOne({ sku });
            if (!existingProduct || existingProduct._id.toString() === product._id.toString()) {
              break;
            }
            sku = `${baseSku}${counter}`;
            counter++;
          }
          
          updates.sku = sku;
          console.log(`  📝 Generated SKU for "${product.name}": ${sku}`);
        }
        
        // Assign sellerId if missing
        if (!product.sellerId) {
          updates.sellerId = adminUser._id;
          console.log(`  👤 Assigned seller for "${product.name}": ${adminUser.name}`);
        }
        
        // Update the product
        if (Object.keys(updates).length > 0) {
          await Product.findByIdAndUpdate(product._id, updates);
          migratedCount++;
        }
        
      } catch (error) {
        console.error(`  ❌ Error migrating product "${product.name}":`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Some products failed to migrate. Please check the errors above.');
    } else {
      console.log('\n🎉 All products migrated successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateExistingProducts();
