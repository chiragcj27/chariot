import mongoose from "mongoose";
import { Item, Image, ItemImage, IItem } from "@chariot/db";

export const menuService = {
  async createItemWithImage(itemData: Partial<IItem>, subCategoryId: mongoose.Types.ObjectId | string, session: mongoose.ClientSession) {
    try {

      const item = await Item.create([{
        title: itemData.title,
        slug: itemData.slug,
        subCategoryId: subCategoryId,
        description: itemData.description,
        image: new mongoose.Types.ObjectId() // temporary image ID
      }], { session });
      
      if (!item[0]) {
        throw new Error('Failed to create item');
      }


      // Create the item image with the required itemId
      const imageData = {
        filename: itemData.image?.filename,
        originalname: itemData.image?.originalname,
        url: itemData.image?.url,
        size: itemData.image?.size,
        mimetype: itemData.image?.mimetype,
        bucket: itemData.image?.bucket || "chariot-images",
        imageType: "item",
        status: "uploaded",
        itemId: item[0]._id // Required field for ItemImage
      };

      const itemImage = await ItemImage.create([imageData], { session });

      if (!itemImage[0]) {
        throw new Error('Failed to create item image');
      }

      const updatedItem = await Item.findByIdAndUpdate(
        item[0]._id,
        { image: itemImage[0]._id },
        { session, new: true }
      );
      
      if (!updatedItem) {
        throw new Error('Failed to update item with image reference');
      }

      return updatedItem;
    } catch (error) {
      console.error('Error in createItemWithImage:', error);
      if (error instanceof mongoose.Error.ValidationError) {
        console.error('Validation error details:', error.errors);
      }
      throw error;
    }
  }
}; 