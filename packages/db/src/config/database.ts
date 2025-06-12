import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Image, ItemImage, PromotionalImage, ProductImage } from '../models/image.model';
import { Menu, SubCategory, Item } from '../models/menu.model';
import { Product, PhysicalProduct, DigitalProduct, ServiceProduct } from '../models/product.model';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    // Register all models
    require('../models/image.model');
    require('../models/menu.model');
    require('../models/product.model');

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 