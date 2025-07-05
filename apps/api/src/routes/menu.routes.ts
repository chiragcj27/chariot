import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router: Router = Router();

// Get full menu structure
router.get('/structure', menuController.getFullMenuStructure);

// Create category
router.post('/category', menuController.createCategory);

// Delete category
router.delete('/category/:categoryId', menuController.deleteCategory);

// Update category
router.put('/category/:categoryId', menuController.updateCategory);

// Create item
router.post('/items', menuController.createItem);

// Delete item
router.delete('/item/:itemId', menuController.deleteItem);

// Update item
router.put('/item/:itemId', menuController.updateItem);

// Check title uniqueness
router.get('/check-category-title/:title', menuController.checkCategoryTitleUnique);

export default router; 