import mongoose from "mongoose";
import { Item, Image, ItemImage, IItem } from "@chariot/db";

export const menuService = {
  async createItemWithImage(itemData: any, categoryId: mongoose.Types.ObjectId | string, session: mongoose.ClientSession) {
    try {

      const item = await Item.create([{
        title: itemData.title,
        slug: itemData.slug,
        categoryId: categoryId,
        description: itemData.description,
        // Only create a temporary image ID if an image is provided
        ...(itemData.image && { image: new mongoose.Types.ObjectId() })
      }], { session });
      
      if (!item[0]) {
        throw new Error('Failed to create item');
      }

      const updateData: any = {};

      // Create the item image only if provided
      if (itemData.image) {
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

        updateData.image = itemImage[0]._id;
      }

      // Handle onHover image if provided
      if (itemData.onHover) {
        const onHoverImageData = {
          filename: itemData.onHover.filename,
          originalname: itemData.onHover.originalname,
          url: itemData.onHover.url,
          size: itemData.onHover.size,
          mimetype: itemData.onHover.mimetype,
          bucket: itemData.onHover.bucket || "chariot-images",
          imageType: "item",
          status: "uploaded",
          itemId: item[0]._id // Required field for ItemImage
        };

        const onHoverItemImage = await ItemImage.create([onHoverImageData], { session });

        if (!onHoverItemImage[0]) {
          throw new Error('Failed to create onHover item image');
        }

        updateData.onHover = onHoverItemImage[0]._id;
      }

      // Only update if there are images to update
      let updatedItem = item[0];
      if (Object.keys(updateData).length > 0) {
        const result = await Item.findByIdAndUpdate(
          item[0]._id,
          updateData,
          { session, new: true }
        );
        
        if (!result) {
          throw new Error('Failed to update item with image reference');
        }
        
        updatedItem = result;
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