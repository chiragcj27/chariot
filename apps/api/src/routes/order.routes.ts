import express from 'express';
import { isBuyer } from '../middleware/buyerAuth';
import {
  getCheckoutInfo,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPaymentStatus,
} from '../controllers/order.controller';

const router = express.Router();

// All routes require buyer authentication
router.use(isBuyer);

// Get checkout information (calculates totals, credits needed, etc.)
router.post('/checkout/info', getCheckoutInfo);

// Create a new order
router.post('/checkout/create', createOrder);

// Get user's orders
router.get('/user/orders', getUserOrders);

// Get specific order by ID
router.get('/user/orders/:orderId', getOrderById);

// Update order payment status (for PayPal webhooks)
router.patch('/orders/:orderId/payment-status', updateOrderPaymentStatus);

export default router;
