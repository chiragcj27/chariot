import { Menu, Item, ItemImage } from "@chariot/db";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { menuService } from "../services/menu.service";

export const menuController = {
  async getFullMenuStructure(req: Request, res: Response) {
    try {
      const menuStructure = await Menu.aggregate([
        // Start with categories
        // For each category, lookup its items
        {
          $lookup: {
            from: "items",
            localField: "_id",
            foreignField: "categoryId",
            as: "items",
          },
        },
        // Lookup images for items
        {
          $lookup: {
            from: "images",
            let: { itemImages: "$items.image" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$itemImages"] },
                      { $eq: ["$imageType", "item"] },
                    ],
                  },
                },
              },
            ],
            as: "itemImages",
          },
        },
        // Lookup onHover images for items
        {
          $lookup: {
            from: "images",
            let: { itemOnHoverImages: "$items.onHover" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$itemOnHoverImages"] },
                      { $eq: ["$imageType", "item"] },
                    ],
                  },
                },
              },
            ],
            as: "itemOnHoverImages",
          },
        },
        // Reshape the data to match the desired structure
        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      image: {
                        $let: {
                          vars: {
                            matchedImage: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$itemImages",
                                    as: "img",
                                    cond: {
                                      $eq: [
                                        { $toString: "$$img._id" },
                                        { $toString: "$$item.image" },
                                      ],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: "$$matchedImage",
                        },
                      },
                      onHover: {
                        $let: {
                          vars: {
                            matchedOnHoverImage: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$itemOnHoverImages",
                                    as: "img",
                                    cond: {
                                      $eq: [
                                        { $toString: "$$img._id" },
                                        { $toString: "$$item.onHover" },
                                      ],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: "$$matchedOnHoverImage",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        // Remove only the temporary image fields, keep items
        {
          $project: {
            itemImages: 0,
            itemOnHoverImages: 0,
          },
        },
      ]);

      // Process the results to match the expected structure
      const processedStructure = menuStructure.map((category) => ({
        _id: category._id,
        title: category.title,
        slug: category.slug,
        featuredItems: category.featuredItems || [],
        items: category.items || [],
      }));

      res.status(200).json(processedStructure);
    } catch (error) {
      console.error("Error fetching menu structure:", error);
      res.status(500).json({
        message: "Error fetching menu structure",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createCategory(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { title, slug } = req.body;

      if (!title || !slug) {
        return res.status(400).json({ message: "Title and slug are required" });
      }

      const category = await Menu.create(
        [
          {
            title,
            slug,
            featuredItems: [],
          },
        ],
        { session }
      );

      if (!category || !category[0]) {
        throw new Error("Failed to create category");
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Category created successfully",
        category: {
          ...category[0].toObject(),
          featuredItems: [],
          items: [],
        },
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res
        .status(500)
        .json({ message: "Error creating category", error: errorMessage });
    } finally {
      session.endSession();
    }
  },

  async createItem(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Expect an array of items in the request body
      const items = Array.isArray(req.body) ? req.body : [req.body];

      // Validate that all items have required fields
      const invalidItems = items.filter(
        (item) => !item.categoryId || !item.title || !item.slug
      );
      if (invalidItems.length > 0) {
        return res.status(400).json({
          message: "Category ID, title, and slug are required for all items",
        });
      }

      const createdItems = [];

      for (const itemData of items) {
        const item = await menuService.createItemWithImage(
          itemData,
          itemData.categoryId,
          session
        );
        if (!item) {
          throw new Error("Failed to create item");
        }
        // Ensure the image data is populated
        const populatedItem = await Item.findById(item._id)
          .populate([
            { 
              path: "image", 
              model: "Image",
              match: { imageType: "item" }
            },
            { 
              path: "onHover", 
              model: "Image",
              match: { imageType: "item" }
            }
          ])
          .session(session);
        if (!populatedItem) {
          throw new Error("Failed to populate item data");
        }
        createdItems.push(populatedItem);
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Items created successfully",
        items: createdItems,
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating items",
        error: errorMessage,
      });
    } finally {
      session.endSession();
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const result = await Menu.findByIdAndDelete(categoryId);
      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting category", error });
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      if (!itemId) {
        return res.status(400).json({ message: "Item ID is required" });
      }

      const result = await Item.findByIdAndDelete(itemId);
      if (!result) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting item", error });
    }
  },

  async checkCategoryTitleUnique(req: Request, res: Response) {
    try {
      const { title } = req.params;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const existingCategory = await Menu.findOne({ title });
      res.status(200).json({ isUnique: !existingCategory });
    } catch (error) {
      res.status(500).json({
        message: "Error checking category title uniqueness",
        error,
      });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { title, slug, featuredItems } = req.body;

      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (featuredItems !== undefined) updateData.featuredItems = featuredItems;

      const result = await Menu.findByIdAndUpdate(categoryId, updateData, {
        new: true,
      });

      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({
        message: "Category updated successfully",
        category: result,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating category", error });
    }
  },

  async updateItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { title, slug, description, image, onHover } = req.body;

      if (!itemId) {
        return res.status(400).json({ message: "Item ID is required" });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (onHover !== undefined) updateData.onHover = onHover;

      const result = await Item.findByIdAndUpdate(itemId, updateData, {
        new: true,
      }).populate([
        { path: "image", model: "Image" },
        { path: "onHover", model: "Image" }
      ]);

      if (!result) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.status(200).json({
        message: "Item updated successfully",
        item: result,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating item", error });
    }
  },
};

/*
Create SubCategory POST request will have a body like this:

{
  categoryId: string;  // ID of the existing category
  title: string;
  slug: string;
  description: string;
  items?: Array<{
    title: string;
    slug: string;
    image: Types.ObjectId;
    description?: string;
  }>;
}

{
  "categoryId": "existing-category-id",
  "title": "Steaks",
  "slug": "steaks",
  "description": "Our finest cuts",
  "items": [
    {
      "title": "Ribeye Steak",
      "slug": "ribeye-steak",
      "image": "imageId",
      "description": "Premium cut ribeye"
    }
  ]
}





Create Category POST request will have a body like this:


   {
     title: string;
     slug: string;
     featuredItems?: Array<{
       id: string;
       title: string;
       price: number;
       image: string;
       slug: string;
     }>;
     subCategories?: Array<{
       title: string;
       slug: string;
       description: string;
       items?: Array<{
         title: string;
         slug: string;
         image: Types.ObjectId;
         description?: string;
       }>;
     }>;
   }


{
  "title": "Main Course",
  "slug": "main-course",
  "featuredItems": [
    {
      "id": "1",
      "title": "Special Steak",
      "price": 29.99,
      "image": "steak.jpg",
      "slug": "special-steak"
    }
  ],
  "subCategories": [
    {
      "title": "Steaks",
      "slug": "steaks",
      "description": "Our finest cuts",
      "items": [
        {
          "title": "Ribeye Steak",
          "slug": "ribeye-steak",
          "image": "imageId",
          "description": "Premium cut ribeye"
        }
      ]
    }
  ]
}
*/
