import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { adminController } from '../controllers/admin.controller';

const router : Router = Router();

// Create a promotional strip
router.post('/admin/add-promotional-strip', requireAdmin, adminController.addPromotionalStrip);

// Get promotional strip
router.get('/admin/get-promotional-strip', requireAdmin, adminController.getPromotionalStrip);

export default router; 