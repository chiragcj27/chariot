import { Menu, SubCategory } from "@chariot/db";
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
};
