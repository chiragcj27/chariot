import { Request, Response } from 'express';
import { User, UserSubscription, SubscriptionCard } from '@chariot/db';
import axios from 'axios';
import crypto from 'crypto';

// Helper: Validate webhook signature using PayPal's verification method
async function verifyPaypalWebhook(req: Request): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  
  // In development, skip verification if webhook ID isn't set
  if (process.env.NODE_ENV === 'development' && !webhookId) {
    return true;
  }
  
  if (!webhookId) {
    console.error('❌ PAYPAL_WEBHOOK_ID not configured');
    return false;
  }
  
  // Note: PayPal doesn't use a traditional webhook secret
  // Verification is done via webhook ID and PayPal's certificate URL

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

    return true;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

export const webhookController = {
  async handlePaypalWebhook(req: Request, res: Response) {
    try {
      // Handle OPTIONS request for CORS
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // For testing without PayPal headers, allow it in development or if no headers present
      const hasPaypalHeaders = req.headers['paypal-transmission-id'] || req.headers['paypal-transmission-sig'];
      
      if (!hasPaypalHeaders) {
        // This might be a test request or webhook verification from PayPal dashboard
        return res.status(200).json({ 
          message: 'Webhook endpoint is accessible',
          note: 'This endpoint expects PayPal webhook events with proper headers',
          webhookId: process.env.PAYPAL_WEBHOOK_ID || 'Not configured'
        });
      }

      // 1. Validate webhook
      const isValid = await verifyPaypalWebhook(req);
      if (!isValid) {
        console.error('❌ Webhook verification failed');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      const event = req.body;
      const eventType = event.event_type;
      const resource = event.resource;

      // 2. Handle key events
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.UPDATED':
        case 'BILLING.SUBSCRIPTION.CREATED': {
          // Handle subscription creation/updates
          const paypalSubscriptionId = resource.id;
          const subscriptionStatus = resource.status;
          
          // Update subscription status based on PayPal status
          const statusMap: Record<string, string> = {
            'ACTIVE': 'active',
            'APPROVAL_PENDING': 'pending',
            'APPROVED': 'active',
            'SUSPENDED': 'suspended',
            'CANCELLED': 'canceled',
            'EXPIRED': 'expired'
          };
          
          const userSub = await UserSubscription.findOneAndUpdate(
            { paypalSubscriptionId },
            { 
              status: statusMap[subscriptionStatus] || 'active',
              ...(subscriptionStatus === 'ACTIVE' && {
                lastPaymentDate: new Date(),
                nextBillingDate: resource.billing_info?.next_billing_time 
                  ? new Date(resource.billing_info.next_billing_time)
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              })
            },
            { new: true }
          );
          
          // If subscription is activated and user exists, add credits
          if (subscriptionStatus === 'ACTIVE' && userSub && userSub.status === 'active') {
            const plan = await SubscriptionCard.findById(userSub.planId);
            if (plan) {
              const user = await User.findById(userSub.userId);
              if (user) {
                (user as any).creditsPoints = ((user as any).creditsPoints || 0) + plan.credits;
                await user.save();
              }
            }
          }
          break;
        }
        case 'PAYMENT.SALE.COMPLETED': {
          // Handle payment completion (works for subscription payments)
          // The subscription should be updated via BILLING.SUBSCRIPTION.UPDATED
          break;
        }
        case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED': {
          const paypalSubscriptionId = resource.id;
          const userSub = await UserSubscription.findOne({ paypalSubscriptionId });
          
          if (userSub && userSub.status === 'active') {
            // Add credits for renewal
            const plan = await SubscriptionCard.findById(userSub.planId);
            if (plan) {
              const user = await User.findById(userSub.userId);
              if (user) {
                (user as any).creditsPoints = ((user as any).creditsPoints || 0) + plan.credits;
                await user.save();
                
                // Update subscription with payment info
                userSub.lastPaymentDate = new Date();
                userSub.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                await userSub.save();
                
              }
            }
          } else {
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
          } else {
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
            // TODO: Send notification to user about payment failure
          } else {
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
          }
          break;
        }
        // Add more event types as needed
        default:
          // Unhandled events are silently ignored
          break;
      }

      // Always respond 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Error handling PayPal webhook:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : error });
    }
  },
}; 