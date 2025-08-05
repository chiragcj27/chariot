import { Request, Response } from 'express';
import { User, UserSubscription, SubscriptionCard } from '@chariot/db';
import axios from 'axios';
import crypto from 'crypto';

// Helper: Validate webhook signature using PayPal's verification method
async function verifyPaypalWebhook(req: Request): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const webhookSecret = process.env.PAYPAL_WEBHOOK_SECRET;
  
  // In development, skip verification if webhook credentials aren't set
  if (process.env.NODE_ENV === 'development' && (!webhookId || !webhookSecret)) {
    console.log('⚠️  Webhook verification skipped in development mode');
    return true;
  }
  
  if (!webhookId || !webhookSecret) {
    console.error('❌ PayPal webhook credentials not configured');
    return false;
  }

  try {
    const transmissionId = req.headers['paypal-transmission-id'] as string;
    const timestamp = req.headers['paypal-transmission-time'] as string;
    const certUrl = req.headers['paypal-cert-url'] as string;
    const authAlgo = req.headers['paypal-auth-algo'] as string;
    const actualSignature = req.headers['paypal-transmission-sig'] as string;

    if (!transmissionId || !timestamp || !certUrl || !authAlgo || !actualSignature) {
      console.error('❌ Missing required webhook headers');
      return false;
    }

    // Verify certificate URL is from PayPal
    if (!certUrl.includes('paypal.com') && !certUrl.includes('sandbox.paypal.com')) {
      console.error('❌ Invalid certificate URL');
      return false;
    }

    // Create the signature string
    const body = JSON.stringify(req.body);
    const signatureString = `${transmissionId}|${timestamp}|${webhookId}|${crypto.createHash('sha256').update(body).digest('hex')}`;

    // Get PayPal's public certificate
    const certResponse = await axios.get(certUrl);
    const publicKey = certResponse.data;

    // Verify signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signatureString);
    const isValid = verifier.verify(publicKey, actualSignature, 'base64');

    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      return false;
    }

    console.log('✅ Webhook signature verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

export const webhookController = {
  async handlePaypalWebhook(req: Request, res: Response) {
    try {
      // 1. Validate webhook
      const isValid = await verifyPaypalWebhook(req);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      const event = req.body;
      const eventType = event.event_type;
      const resource = event.resource;

      console.log(`📨 Received PayPal webhook: ${eventType}`);

      // 2. Handle key events
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED': {
          const paypalSubscriptionId = resource.id;
          const userSub = await UserSubscription.findOne({ paypalSubscriptionId });
          
          if (userSub && userSub.status === 'active') {
            // Add credits for renewal
            const plan = await SubscriptionCard.findById(userSub.planId);
            if (plan) {
              const user = await User.findById(userSub.userId);
              if (user) {
                user.credits = (user.credits || 0) + plan.credits;
                await user.save();
                
                // Update subscription with payment info
                userSub.lastPaymentDate = new Date();
                userSub.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                await userSub.save();
                
                console.log(`✅ Credits added for subscription ${paypalSubscriptionId}: +${plan.credits} credits`);
              }
            }
          } else {
            console.log(`⚠️  Subscription ${paypalSubscriptionId} not found or not active`);
          }
          break;
        }
        case 'BILLING.SUBSCRIPTION.CANCELLED': {
          const paypalSubscriptionId = resource.id;
          const updatedSub = await UserSubscription.findOneAndUpdate(
            { paypalSubscriptionId },
            { 
              status: 'canceled', 
              endDate: new Date(resource.update_time || Date.now()) 
            },
            { new: true }
          );
          
          if (updatedSub) {
            console.log(`✅ Subscription ${paypalSubscriptionId} marked as canceled`);
          } else {
            console.log(`⚠️  Subscription ${paypalSubscriptionId} not found for cancellation`);
          }
          break;
        }
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
          const paypalSubscriptionId = resource.id;
          const updatedSub = await UserSubscription.findOneAndUpdate(
            { paypalSubscriptionId },
            { status: 'past_due' },
            { new: true }
          );
          
          if (updatedSub) {
            console.log(`⚠️  Subscription ${paypalSubscriptionId} marked as past due`);
            // TODO: Send notification to user about payment failure
          } else {
            console.log(`⚠️  Subscription ${paypalSubscriptionId} not found for payment failure`);
          }
          break;
        }
        case 'BILLING.SUBSCRIPTION.ACTIVATED': {
          const paypalSubscriptionId = resource.id;
          const updatedSub = await UserSubscription.findOneAndUpdate(
            { paypalSubscriptionId },
            { status: 'active' },
            { new: true }
          );
          
          if (updatedSub) {
            console.log(`✅ Subscription ${paypalSubscriptionId} activated`);
          }
          break;
        }
        case 'BILLING.SUBSCRIPTION.SUSPENDED': {
          const paypalSubscriptionId = resource.id;
          const updatedSub = await UserSubscription.findOneAndUpdate(
            { paypalSubscriptionId },
            { status: 'suspended' },
            { new: true }
          );
          
          if (updatedSub) {
            console.log(`⚠️  Subscription ${paypalSubscriptionId} suspended`);
          }
          break;
        }
        // Add more event types as needed
        default:
          // Log unhandled events
          console.log(`ℹ️  Unhandled PayPal webhook event: ${eventType}`);
      }

      // Always respond 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Error handling PayPal webhook:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : error });
    }
  },
}; 