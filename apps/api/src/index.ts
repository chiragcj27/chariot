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
import adminRoutes from './routes/admin';
import adminProductRoutes from './routes/admin/products.routes';
import kitRoutes from './routes/kit.routes';
import fileRoutes from './routes/file.routes';
import subscriptionCardRoutes from './routes/subscriptionCard.routes';
import adminSubscriptionCardRoutes from './routes/admin/subscriptionCard.routes';
import subscriptionRoutes from './routes/subscription.routes';
import buyerRoutes from './routes/buyer.routes';
import orderRoutes from './routes/order.routes';
import passwordResetRoutes from './routes/password-reset.routes';
import marketplaceRoutes from './routes/marketplace.routes';


dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || '';

const allowedOrigins = [
  'https://chariot-website.vercel.app',
  'http://localhost:3000',
  'https://chariot-admin.vercel.app',
  'http://localhost:3002',
  'https://chariot-seller-portal.vercel.app'
];

// CORS configuration with debugging
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Blocking origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// CORS debugging endpoint
app.get('/api/cors-debug', (req, res) => {
  res.json({
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api', adminRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/subscription-cards', subscriptionCardRoutes);
app.use('/api/admin/subscription-cards', adminSubscriptionCardRoutes);
app.use('/api/subscribe', subscriptionRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/marketplace', marketplaceRoutes);
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