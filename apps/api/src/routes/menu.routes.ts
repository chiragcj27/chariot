import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router: Router = Router();

// Get full menu structure
router.get('/structure', menuController.getFullMenuStructure);

// Get items by subcategory ID
router.get('/subcategory/:subCategoryId/items', menuController.getItemsBySubCategoryId);

// Get items by subcategory slug
router.get('/subcategory/by-slug/:slug/items', menuController.getItemsBySubCategorySlug);

// Get subCategory by slug
router.get('/subcategory/by-slug/:slug', menuController.getSubCategoryBySlug);

export default router; 