import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import menuRoutes from './routes/menu.routes';
import path from 'path';
import assetRoutes from './routes/asset.routes';
import productRoutes from './routes/product.routes';
import landingRoutes from './routes/landing.routes';
import authRoutes from './routes/auth.routes';
import sellerRoutes from './routes/seller.routes';
import sellerApprovalRoutes from './routes/admin/seller-approval.routes';
import sellerBlacklistRoutes from './routes/admin/seller-blacklist.routes';
import adminProductRoutes from './routes/admin/product.routes';
import kitRoutes from './routes/kit.routes';
import subscriptionCardRoutes from './routes/subscriptionCard.routes';
import adminSubscriptionCardRoutes from './routes/admin/subscriptionCard.routes';


dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || '';

// Middleware
app.use(cors({
  origin: 'https://chariot-website.vercel.app',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin/sellers', sellerApprovalRoutes);
app.use('/api/admin/blacklist', sellerBlacklistRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/subscription-cards', subscriptionCardRoutes);
app.use('/api/admin/subscription-cards', adminSubscriptionCardRoutes);
// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 