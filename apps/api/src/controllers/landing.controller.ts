import { Request, Response } from "express";
import { Image, Product } from "@chariot/db";
import { s3Service } from "../services/s3.service";

export const landingController = {
  // Banner Management
  async createBanner(req: Request, res: Response) {
    try {
      const { 
        filename, 
        originalname, 
        url, 
        size, 
        mimetype, 
        width, 
        height, 
        redirectUrl, 
        deviceType = 'both',
        rotationOrder,
        isActive = true 
      } = req.body;

      const banner = await Image.create({
        filename,
        originalname,
        url,
        size,
        mimetype,
        width,
        height,
        redirectUrl,
        deviceType,
        rotationOrder,
        isActive,
        imageType: 'banner',
        status: 'uploaded'
      });

      res.status(201).json(banner);
    } catch (error) {
      console.error('Error in createBanner:', error);
      res.status(500).json({
        message: "Error creating banner",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

  async getBanners(req: Request, res: Response) {
    try {
      const { deviceType } = req.query;
      const query: any = { 
        isActive: true,
        imageType: 'banner'
      };
      
      if (deviceType) {
        query.deviceType = deviceType;
      }

      const banners = await Image.find(query)
        .sort({ rotationOrder: 1 })
        .select('-__v');

      res.status(200).json(banners);
    } catch (error) {
      console.error('Error in getBanners:', error);
      res.status(500).json({
        message: "Error fetching banners",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

  async updateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const banner = await Image.findOneAndUpdate(
        { _id: id, imageType: 'banner' },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(200).json(banner);
    } catch (error) {
      console.error('Error in updateBanner:', error);
      res.status(500).json({
        message: "Error updating banner",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

  async deleteBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const banner = await Image.findOne({ _id: id, imageType: 'banner' });

      if (banner) {
        await Image.deleteOne({ _id: id, imageType: 'banner' });
      }

      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error('Error in deleteBanner:', error);
      res.status(500).json({
        message: "Error deleting banner",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

  // Featured Products
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const { limit = 8 } = req.query;
      
      const products = await Product.find({ 
        isFeatured: true,
        isActive: true 
      })
        .limit(Number(limit))
        .sort({ updatedAt: -1 })
        .select('name price images description slug');

      res.status(200).json(products);
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      res.status(500).json({
        message: "Error fetching featured products",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

}