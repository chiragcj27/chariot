import { Menu, SubCategory, Item, ItemImage } from "@chariot/db";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { menuService } from "../services/menu.service";

export const menuController = {
  async getFullMenuStructure(req: Request, res: Response) {
    try {
      const menuStructure = await Menu.aggregate([
        // Start with categories
        {
          $lookup: {
            from: "subcategories",
            let: { categoryId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$categoryId", "$$categoryId"] },
                },
              },
            ],
            as: "subCategories",
          },
        },
        // For each subcategory, lookup its items
        {
          $lookup: {
            from: "items",
            localField: "subCategories._id",
            foreignField: "subCategoryId",
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
        // Reshape the data to match the desired structure
        {
          $addFields: {
            subCategories: {
              $map: {
                input: "$subCategories",
                as: "subCategory",
                in: {
                  $mergeObjects: [
                    "$$subCategory",
                    {
                      items: {
                        $map: {
                          input: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.subCategoryId",
                                  "$$subCategory._id",
                                ],
                              },
                            },
                          },
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
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        // Remove the temporary fields
        {
          $project: {
            items: 0,
            itemImages: 0,
          },
        },
      ]);

      res.status(200).json(menuStructure);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting full menu structure", error });
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
            subCategories: [],
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
          subCategories: [],
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

  async createSubCategory(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { categoryId, title, slug, description, items } = req.body;

      // Validate required fields
      if (!categoryId || !title || !slug) {
        return res.status(400).json({
          message: "Category ID, title, and slug are required",
        });
      }

      // Check if category exists
      const category = await Menu.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          message: "Parent category not found",
        });
      }

      // Create subcategory
      const subCategory = await SubCategory.create(
        [
          {
            title,
            slug,
            description,
            categoryId,
            items: [],
          },
        ],
        { session }
      );

      if (!subCategory || !subCategory[0]) {
        throw new Error("Failed to create subcategory");
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Subcategory created successfully",
        subCategory: subCategory[0],
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating subcategory",
        error: errorMessage,
      });
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
        (item) => !item.subCategoryId || !item.title || !item.slug
      );
      if (invalidItems.length > 0) {
        return res.status(400).json({
          message: "Subcategory ID, title, and slug are required for all items",
        });
      }

      const createdItems = [];

      for (const itemData of items) {
        const item = await menuService.createItemWithImage(
          itemData,
          itemData.subCategoryId,
          session
        );
        if (!item) {
          throw new Error("Failed to create item");
        }
        // Ensure the image data is populated
        const populatedItem = await Item.findById(item._id)
          .populate({ path: "image", model: "Image" })
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

  async checkSubCategoryTitleUnique(req: Request, res: Response) {
    try {
      const { title } = req.params;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const existingSubCategory = await SubCategory.findOne({ title });
      res.status(200).json({ isUnique: !existingSubCategory });
    } catch (error) {
      res.status(500).json({
        message: "Error checking subcategory title uniqueness",
        error,
      });
    }
  },

  async checkItemTitleUnique(req: Request, res: Response) {
    try {
      const { title } = req.params;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const existingItem = await Item.findOne({ title });
      res.status(200).json({ isUnique: !existingItem });
    } catch (error) {
      res.status(500).json({
        message: "Error checking item title uniqueness",
        error,
      });
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

  async deleteSubCategory(req: Request, res: Response) {
    try {
      const { subCategoryId } = req.params;
      if (!subCategoryId) {
        return res.status(400).json({ message: "SubCategory ID is required" });
      }

      const result = await SubCategory.findByIdAndDelete(subCategoryId);
      if (!result) {
        return res.status(404).json({ message: "SubCategory not found" });
      }

      res.status(200).json({ message: "SubCategory deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting subcategory", error });
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
