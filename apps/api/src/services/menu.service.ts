import mongoose from "mongoose";
import { Item, ItemImage, IItem } from "@chariot/db";

export const menuService = {
  async createItemWithImage(itemData: Partial<IItem>, subCategoryId: mongoose.Types.ObjectId | string, session: mongoose.ClientSession) {
    // Create the item
    const item = await Item.create([{
      title: itemData.title,
      slug: itemData.slug,
      subCategoryId: subCategoryId,
      description: itemData.description,
      image: null, // set later
    }], { session });
    
    // Create the item image
    const itemImage = await ItemImage.create([{
      ...itemData.image,
      itemId: item[0]!._id,
      bucket: "chariot-images",
      imageType: "item",
      status: "uploaded"
    }], { session });

    // Update the item with the image reference
    await Item.findByIdAndUpdate(item[0]!._id, { image: itemImage[0]!._id }, { session });
    
    return item[0];
  }
}; 