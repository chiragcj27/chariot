import { Request, Response } from 'express';
import { User, SubscriptionCard, UserSubscription } from '@chariot/db';
import { paypalService } from '../services/paypal.service';

export const subscriptionController = {
  async confirmSubscription(req: Request, res: Response) {
    try {
      const { paypalSubscriptionId, planKey } = req.body;
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      if (!paypalSubscriptionId || !planKey) {
        return res.status(400).json({ message: 'Missing PayPal subscription ID or plan key' });
      }

      // 2. Find the plan
      const plan = await SubscriptionCard.findOne({ planKey });
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Check if this is a mock subscription (for testing)
      const isMockSubscription = paypalSubscriptionId.startsWith('sub_');
      
      if (!isMockSubscription) {
        // 1. Verify PayPal subscription (only for real subscriptions)
        const paypalSub = await paypalService.getSubscription(paypalSubscriptionId);
        if (!paypalSub || paypalSub.status !== 'ACTIVE') {
          return res.status(400).json({ message: 'PayPal subscription is not active' });
        }
      }

      // 3. Create UserSubscription
      const userSub = await UserSubscription.create({
        userId,
        planId: plan._id,
        paypalSubscriptionId,
        status: 'active',
        startDate: new Date(),
        nextBillingDate: isMockSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days from now for mock
      });

      // 4. Update user credits
      const user = await User.findById(userId);
      if (user) {
        user.credits = (user.credits || 0) + plan.credits;
        await user.save();
      }

      return res.status(200).json({
        message: 'Subscription confirmed and credits granted',
        subscription: {
          id: userSub._id,
          status: userSub.status,
          startDate: userSub.startDate,
          nextBillingDate: userSub.nextBillingDate,
        },
        credits: user?.credits,
        plan: {
          title: plan.title,
          credits: plan.credits,
        }
      });
    } catch (error) {
      console.error('Error confirming subscription:', error);
      return res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : error });
    }
  },
}; 