import { Router } from 'express';
import { isAdmin } from '../middleware/adminAuth';
import { adminController } from '../controllers/admin.controller';

const router : Router = Router();

// Create a promotional strip
router.post('/admin/add-promotional-strip', isAdmin, adminController.addPromotionalStrip);

// Get promotional strip
router.get('/admin/get-promotional-strip', isAdmin, adminController.getPromotionalStrip);

export default router; 