import { Router } from 'express';
import { generateInvoice } from '../controllers/invoice.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Generate invoice HTML for a specific order
router.get('/:orderId', authenticateToken, generateInvoice);

export default router;
