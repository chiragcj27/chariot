import { Image, ItemImage} from "@chariot/db";
import mongoose from "mongoose";

export const imageService = {
  async createImageDocument(imageData: {
    filename: string;
    originalname: string;
    url: string;
    size: number;
    mimetype: string;
    width?: number;
    height?: number;
    bucket?: string;
    metadata?: Record<string, any>;
    status: 'pending' | 'uploaded' | 'failed';
    imageType: string;
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create base image document
      const image = await Image.create([{
        ...imageData,
      }], { session });

      if (!image || !image[0]) {
        throw new Error("Failed to create image document");
      }

      await session.commitTransaction();
      return image[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async createItemImageDocument(imageId: string, itemId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create item image document
      const itemImage = await ItemImage.create([{
        _id: new mongoose.Types.ObjectId(imageId),
        itemId: new mongoose.Types.ObjectId(itemId)
      }], { session });

      if (!itemImage || !itemImage[0]) {
        throw new Error("Failed to create item image document");
      }

      await session.commitTransaction();
      return itemImage[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}; 