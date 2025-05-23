import { connectDB } from './src';
import { MenuItem } from './src/models/menu.model';
import mongoose from 'mongoose';

interface MenuItemData {
  title: string;
  slug: string;
  children?: MenuItemData[];
}

// Menu structure based on the provided screenshot
const menuData: MenuItemData[] = [
  {
    title: 'Marketing & Sales', slug: 'marketing-sales', children: [
      {
        title: 'Print Marketing', slug: 'print-marketing', children: [
          { title: 'Catalogs', slug: 'catalogs' },
          { title: 'Brochures', slug: 'brochures' },
          { title: 'Flyers', slug: 'flyers' },
          { title: 'Leaflets', slug: 'leaflets' },
        ]
      },
      {
        title: 'Digital Marketing', slug: 'digital-marketing', children: [
          { title: 'Social Media', slug: 'social-media' },
          { title: 'Email marketing', slug: 'email-marketing' },
          { title: 'Website Content', slug: 'website-content' },
          { title: 'SEO', slug: 'seo' },
          { title: 'Online Advertising', slug: 'online-advertising' },
        ]
      },
      {
        title: 'Promotional Material', slug: 'promotional-material', children: [
          { title: 'Gift certificates', slug: 'gift-certificates' },
          { title: 'Posters', slug: 'posters' },
          { title: 'Duratrans', slug: 'duratrans' },
          { title: 'Window Clings', slug: 'window-clings' },
          { title: 'Danglers', slug: 'danglers' },
        ]
      },
      {
        title: 'Photography', slug: 'photography', children: [
          { title: 'Product photography', slug: 'product-photography' },
          { title: 'Lifestyle Photography', slug: 'lifestyle-photography' },
          { title: 'Videos', slug: 'videos' },
        ]
      },
    ]
  },
  {
    title: 'Design Services', slug: 'design-services', children: [
      {
        title: 'Jewelry design', slug: 'jewelry-design', children: [
          { title: 'Sketches', slug: 'sketches' },
          { title: 'Renders', slug: 'renders' },
          { title: 'CAD design', slug: 'cad-design' },
          { title: '3D Modeling', slug: '3d-modeling' },
        ]
      },
      {
        title: 'Marketing Material Design', slug: 'marketing-material-design', children: [
          { title: 'Ads', slug: 'ads' },
          { title: 'Social Media Graphics', slug: 'social-media-graphics' },
          { title: 'Website Banners', slug: 'website-banners' },
        ]
      },
      {
        title: 'Packaging design', slug: 'packaging-design', children: [
          { title: 'Boxes', slug: 'boxes' },
          { title: 'Bags', slug: 'bags' },
          { title: 'Pouch', slug: 'pouch' },
          { title: 'Labels', slug: 'labels' },
          { title: 'Custom Box', slug: 'custom-box' },
        ]
      },
      {
        title: 'Display Design', slug: 'display-design', children: [
          { title: 'Window display concepts', slug: 'window-display-concepts' },
          { title: 'In-store display layouts', slug: 'in-store-display-layouts' },
          { title: 'Signage & Graphics', slug: 'signage-graphics' },
        ]
      },
    ]
  },
  {
    title: 'Point of Sale', slug: 'point-of-sale', children: [
      {
        title: 'Display Solutions', slug: 'display-solutions', children: [
          { title: 'Trays', slug: 'trays' },
          { title: 'Travel Organisers', slug: 'travel-organisers' },
          { title: 'Program Displays', slug: 'program-displays' },
        ]
      },
      {
        title: 'POS Materials', slug: 'pos-materials', children: [
          { title: 'Counter displays', slug: 'counter-displays' },
          { title: 'Signage', slug: 'signage' },
          { title: 'Sales Training material', slug: 'sales-training-material' },
        ]
      },
    ]
  },
  {
    title: 'Branding & Identity', slug: 'branding-identity', children: [
      {
        title: 'Brand Development', slug: 'brand-development', children: [
          { title: 'Logo designs', slug: 'logo-designs' },
          { title: 'Brand Guidelines', slug: 'brand-guidelines' },
        ]
      },
      {
        title: 'Brand Collaterals', slug: 'brand-collaterals', children: [
          { title: 'Business cards & Stationery', slug: 'business-cards-stationery' },
          { title: 'Website Design', slug: 'website-design' },
          { title: 'Email Signature design', slug: 'email-signature-design' },
          { title: 'SWAG', slug: 'swag' },
        ]
      },
    ]
  },
];

// Recursive function to insert menu items with parent-child relationships
async function insertMenuItems(items: MenuItemData[], parentId: mongoose.Types.ObjectId | null = null) {
  for (const item of items) {
    const menuItem = await MenuItem.create({
      title: item.title,
      slug: item.slug,
      parentId,
      filters: [],
    });
    if (item.children) {
      await insertMenuItems(item.children, menuItem._id);
    }
  }
}

async function seed() {
  await connectDB();
  await MenuItem.deleteMany({}); // Clear existing menu items
  await insertMenuItems(menuData);
  console.log('Menu items seeded successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 