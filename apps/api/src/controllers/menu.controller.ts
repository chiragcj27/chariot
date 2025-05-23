import { Request, Response } from 'express';
import { Menu } from '@chariot/db/src';
import { createSlug } from '@chariot/utils';

export const menuController = {
  // Get all menu categories
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Menu.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  },

  // Get a single category by slug
  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await Menu.findOne({ slug });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category', error });
    }
  },

  // Create a new category
  async createCategory(req: Request, res: Response) {
    try {
      const { title, subCategories, featuredItems } = req.body;
      const slug = createSlug(title);

      const category = new Menu({
        title,
        slug,
        subCategories: subCategories.map((sub: any) => ({
          ...sub,
          slug: createSlug(sub.title),
          items: sub.items.map((item: any) => ({
            ...item,
            slug: createSlug(item.title)
          }))
        })),
        featuredItems: featuredItems.map((item: any) => ({
          ...item,
          slug: createSlug(item.title)
        }))
      });

      await category.save();
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  },

  // Update a category
  async updateCategory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { title, subCategories, featuredItems } = req.body;
      
      const category = await Menu.findOne({ slug });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const updatedCategory = await Menu.findOneAndUpdate(
        { slug },
        {
          title,
          slug: createSlug(title),
          subCategories: subCategories.map((sub: any) => ({
            ...sub,
            slug: createSlug(sub.title),
            items: sub.items.map((item: any) => ({
              ...item,
              slug: createSlug(item.title)
            }))
          })),
          featuredItems: featuredItems.map((item: any) => ({
            ...item,
            slug: createSlug(item.title)
          }))
        },
        { new: true }
      );

      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Error updating category', error });
    }
  },

  // Delete a category
  async deleteCategory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await Menu.findOneAndDelete({ slug });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category', error });
    }
  }
}; 