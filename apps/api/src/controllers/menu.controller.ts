import { Menu, SubCategory, Item, ItemImage } from "@chariot/db";
import mongoose from "mongoose";
import { Request, Response } from "express";

export const menuController = {
  async getFullMenuStructure(req: Request, res: Response) {
    try {
      const menuStructure = await Menu.aggregate([
        // Start with categories
        {
          $lookup: {
            from: "subcategories",
            localField: "_id",
            foreignField: "categoryId",
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
                        $filter: {
                          input: "$items",
                          as: "item",
                          cond: {
                            $eq: ["$$item.subCategoryId", "$$subCategory._id"],
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
        // Remove the temporary items field
        {
          $project: {
            items: 0,
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

  async getItemsBySubCategoryId(req: Request, res: Response) {
    try {
      const { subCategoryId } = req.params;
      if (!subCategoryId) {
        return res.status(400).json({ message: "SubCategory ID is required" });
      }

      const subCategoryWithItems = await SubCategory.aggregate([
        // Match the specific subcategory
        {
          $match: {
            _id: new mongoose.Types.ObjectId(subCategoryId),
          },
        },
        // Lookup items for this subcategory
        {
          $lookup: {
            from: "items",
            localField: "_id",
            foreignField: "subCategoryId",
            as: "items",
          },
        },
        // Sort items if needed (e.g., by title)
        {
          $addFields: {
            items: {
              $sortArray: {
                input: "$items",
                sortBy: { title: 1 },
              },
            },
          },
        },
      ]);

      res.status(200).json(subCategoryWithItems[0] || null);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting items by subcategory", error });
    }
  },

  async getItemsBySubCategorySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ message: "SubCategory slug is required" });
      }

      const subCategoryWithItems = await SubCategory.aggregate([
        // Match the specific subcategory by slug
        {
          $match: {
            slug: slug,
          },
        },
        // Lookup items for this subcategory
        {
          $lookup: {
            from: "items",
            localField: "_id",
            foreignField: "subCategoryId",
            as: "items",
          },
        },
        // Sort items if needed (e.g., by title)
        {
          $addFields: {
            items: {
              $sortArray: {
                input: "$items",
                sortBy: { title: 1 },
              },
            },
          },
        },
      ]);

      res.status(200).json(subCategoryWithItems[0] || null);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting items by subcategory slug", error });
    }
  },

  async getSubCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ message: "SubCategory slug is required" });
      }

      const subCategory = await SubCategory.findOne({ slug });
      if (!subCategory) {
        return res.status(404).json({ message: "SubCategory not found" });
      }
      res.status(200).json(subCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting subCategory by slug", error });
    }
  },

  async createCategory(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { title, slug, featuredItems, subCategories } = req.body;

      // Validate required fields
      if (!title || !slug) {
        return res.status(400).json({ message: "Title and slug are required" });
      }

      // Create the category
      const category = await Menu.create([{
        title,
        slug,
        featuredItems: featuredItems || []
      }], { session });

      if (!category || !category[0]) {
        throw new Error("Failed to create category");
      }

      // If subcategories are provided, create them
      if (subCategories && Array.isArray(subCategories)) {
        const subCategoryPromises = subCategories.map(async (subCategory) => {
          const { title, slug, description, items } = subCategory;

          // Create subcategory
          const newSubCategory = await SubCategory.create([{
            title,
            slug,
            description,
            categoryId: category[0]!._id
          }], { session });

          if (!newSubCategory || !newSubCategory[0]) {
            throw new Error("Failed to create subcategory");
          }

          // If items are provided for this subcategory, create them
          if (items && Array.isArray(items)) {
            const itemPromises = items.map(item => 
              Item.create([{
                ...item,
                subCategoryId: newSubCategory[0]!._id
              }], { session })
            );
            await Promise.all(itemPromises);
          }

          return newSubCategory[0];
        });

        await Promise.all(subCategoryPromises);
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Category created successfully",
        category: category[0]
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating category",
        error: errorMessage
      });
    } finally {
      session.endSession();
    }
  },

  async getAllCategoriesTitles(req: Request, res: Response) {
    try {
      const categories = await Menu.find({}, { title: 1 });
      res.status(200).json(categories.map(category => category.title));
    } catch (error) {
      res.status(500).json({ message: "Error getting all categories", error });
    }
  },

  async getCategoryIdByTitle(req: Request, res: Response) {
    try {
      const { title } = req.params;
      const category = await Menu.findOne({ title });
      res.status(200).json(category?._id);
    } catch (error) {
      res.status(500).json({ message: "Error getting category ID by title", error });
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
          message: "Category ID, title, and slug are required" 
        });
      }

      // Check if category exists
      const category = await Menu.findById(categoryId);
      if (!category) {
        return res.status(404).json({ 
          message: "Parent category not found" 
        });
      }

      // Create subcategory
      const subCategory = await SubCategory.create([{
        title,
        slug,
        description,
        categoryId
      }], { session });

      if (!subCategory || !subCategory[0]) {
        throw new Error("Failed to create subcategory");
      }

      // If items are provided, create them
      if (items && Array.isArray(items)) {
        const itemPromises = items.map(item => 
          Item.create([{
            ...item,
            subCategoryId: subCategory[0]!._id
          }], { session })
        );
        await Promise.all(itemPromises);
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Subcategory created successfully",
        subCategory: subCategory[0]
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating subcategory",
        error: errorMessage
      });
    } finally {
      session.endSession();
    }
  },

  async getAllSubCategoriesTitles(req: Request, res: Response) {
    try {
      const subCategories = await SubCategory.find({}, { title: 1 });
      res.status(200).json(subCategories.map(subCategory => subCategory.title));
    } catch (error) {
      res.status(500).json({ message: "Error getting all subcategories titles", error });
    }
  },

  async getSubCategoryIdByTitle(req: Request, res: Response) {
    try {
      const { title } = req.params;
      const subCategory = await SubCategory.findOne({ title });
      res.status(200).json(subCategory?._id);
    } catch (error) {
      res.status(500).json({ message: "Error getting subcategory ID by title", error });  
    }
  },

  async createItem(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Expect an array of items in the request body
      const items = Array.isArray(req.body) ? req.body : [req.body];

      // Validate that all items have required fields
      const invalidItems = items.filter(item => !item.subCategoryId || !item.title || !item.slug);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Subcategory ID, title, and slug are required for all items" 
        });
      }

      const createdItems = [];

      // Process each item
      for (const itemData of items) {
        const item = await Item.create([{
          title: itemData.title,
          slug: itemData.slug,
          subCategoryId: itemData.subCategoryId,
          description: itemData.description,
          image: null, // set later
        }], { session });
        
        const itemImage = await ItemImage.create([{
          ...itemData.image,
          itemId: item[0]!._id,
          bucket: "chariot-images",
          imageType: "item",
          status: "uploaded"
        }], { session });

        await Item.findByIdAndUpdate(item[0]!._id, { image: itemImage[0]!._id }, { session });
        
        createdItems.push(item[0]);
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Items created successfully",
        items: createdItems
      });
    } catch (error: unknown) {
      await session.abortTransaction();
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating items",
        error: errorMessage
      });
    } finally {
      session.endSession();
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


