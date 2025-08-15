import { Router } from 'express';
import { isAdmin } from '../middleware/adminAuth';
import { adminController } from '../controllers/admin.controller';
import sellerApprovalRoutes from './admin/seller-approval.routes';
import buyerApprovalRoutes from './admin/buyer-approval.routes';

const router : Router = Router();

// Create a promotional strip
router.post('/admin/add-promotional-strip', isAdmin, adminController.addPromotionalStrip);

// Get promotional strip
router.get('/admin/get-promotional-strip', isAdmin, adminController.getPromotionalStrip);

// Seller approval routes
router.use('/admin/sellers', sellerApprovalRoutes);

// Buyer approval routes
router.use('/admin/buyers', buyerApprovalRoutes);

export default router; 