import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router: Router = Router();

// Get all categories
router.get('/categories', menuController.getAllCategories);

// Get a single category by slug
router.get('/categories/:slug', menuController.getCategoryBySlug);

// Create a new category
router.post('/categories', menuController.createCategory);

// Update a category
router.put('/categories/:slug', menuController.updateCategory);

// Delete a category
router.delete('/categories/:slug', menuController.deleteCategory);

export default router; 