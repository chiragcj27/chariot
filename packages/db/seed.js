"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("./src");
const menu_model_1 = require("./src/models/menu.model");
const mongoose_1 = __importDefault(require("mongoose"));
// Menu structure based on the provided screenshot
const menuData = [
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
function insertMenuItems(items_1) {
    return __awaiter(this, arguments, void 0, function* (items, parentId = null) {
        for (const item of items) {
            const menuItem = yield menu_model_1.MenuItem.create({
                title: item.title,
                slug: item.slug,
                parentId,
                filters: [],
            });
            if (item.children) {
                yield insertMenuItems(item.children, menuItem._id);
            }
        }
    });
}
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, src_1.connectDB)();
        yield menu_model_1.MenuItem.deleteMany({}); // Clear existing menu items
        yield insertMenuItems(menuData);
        console.log('Menu items seeded successfully!');
        yield mongoose_1.default.disconnect();
    });
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
