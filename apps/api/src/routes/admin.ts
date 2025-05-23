import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { adminController } from '../controllers/admin.controller';

const router : Router = Router();

// Create a promotional strip
router.post('/admin/promotional-strip', requireAdmin, adminController.createPromotionalStrip);

// Get promotional strip
router.get('/admin/promotional-strip', requireAdmin, adminController.getPromotionalStrip);

export default router; 