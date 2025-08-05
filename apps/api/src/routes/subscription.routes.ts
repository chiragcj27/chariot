import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { isBuyer } from '../middleware/buyerAuth';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

// Confirm PayPal subscription and grant credits (for buyers)
router.post('/confirm', isBuyer, subscriptionController.confirmSubscription);

// PayPal webhook (no auth required)
router.post('/webhook', webhookController.handlePaypalWebhook);

export default router; 