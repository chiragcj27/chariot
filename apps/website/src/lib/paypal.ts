// PayPal SDK types
declare global {
  interface Window {
    paypal: {
      Buttons: (config: PayPalButtonConfig | PayPalPaymentButtonConfig) => { render: (container: string | HTMLElement) => void };
    };
  }
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PayPalSubscriptionData {
  planId: string;
  planKey: string;
  title: string;
  price: number;
  credits: number;
}

interface PayPalPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
}

interface PayPalActions {
  subscription: {
    create: (params: { plan_id: string }) => Promise<string>;
    get: () => Promise<{ id: string; [key: string]: unknown }>;
  };
  order: {
    create: (params: { purchase_units: Array<{ amount: { value: string; currency_code: string }; description?: string }> }) => Promise<string>;
    capture: (orderId: string) => Promise<{ id: string; status: string; [key: string]: unknown }>;
  };
}

interface PayPalButtonConfig {
  createSubscription: (data: unknown, actions: PayPalActions) => Promise<string>;
  onApprove: (data: unknown, actions: PayPalActions) => Promise<void>;
  onError: (err: unknown) => void;
}

interface PayPalPaymentButtonConfig {
  createOrder: (data: unknown, actions: PayPalActions) => Promise<string>;
  onApprove: (data: { orderID: string }, actions: PayPalActions) => Promise<void>;
  onError: (err: unknown) => void;
}

export class PayPalService {
  private static instance: PayPalService;
  private paypal!: Window['paypal'];
  private planCache: Map<string, string> = new Map();

  private constructor() {
    // Don't load script in constructor to avoid SSR issues
  }

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  private loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        reject(new Error('PayPal script can only be loaded in browser environment'));
        return;
      }

      if (window.paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.onload = () => {
        this.paypal = window.paypal;
        resolve();
      };
      script.onerror = reject;
      
      // Check if script is already added to prevent duplicates
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (!existingScript) {
        // Add script with a unique ID to prevent conflicts
        script.id = `paypal-script-${Date.now()}`;
        document.head.appendChild(script);
      } else {
        // If script exists, check if PayPal is loaded
        if (window.paypal) {
          this.paypal = window.paypal;
        }
        resolve();
      }
    });
  }

  private loadPayPalPaymentScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        reject(new Error('PayPal script can only be loaded in browser environment'));
        return;
      }

      // If PayPal is already loaded, check if it has the order functionality
      if (window.paypal) {
        // Check if the PayPal instance has order functionality
        if (window.paypal.Buttons && typeof window.paypal.Buttons === 'function') {
          this.paypal = window.paypal;
          resolve();
          return;
        }
      }

      // Load PayPal script for one-time payments
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=capture`;
      script.onload = () => {
        this.paypal = window.paypal;
        resolve();
      };
      script.onerror = reject;
      
      // Check if script is already added to prevent duplicates
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (!existingScript) {
        // Add script with a unique ID to prevent conflicts
        script.id = `paypal-payment-script-${Date.now()}`;
        document.head.appendChild(script);
      } else {
        // If script exists, check if PayPal is loaded
        if (window.paypal) {
          this.paypal = window.paypal;
        }
        resolve();
      }
    });
  }

  private async getPayPalPlanId(planKey: string): Promise<string> {
    // Check cache first
    if (this.planCache.has(planKey)) {
      return this.planCache.get(planKey)!;
    }

    try {
      // Fetch plan from API
      const response = await fetch(`${API_URL}/api/subscription-cards`);
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription cards: ${response.status}`);
      }
      
      const cards = await response.json();
      
      const card = cards.find((c: { planKey: string; paypalPlanId?: string }) => c.planKey === planKey);
      
      if (!card) {
        throw new Error(`Plan not found: ${planKey}`);
      }
      
      if (!card.paypalPlanId || card.paypalPlanId === 'P-5ML4271244454362XMQIZHI') {
        console.warn(`⚠️  PayPal plan ID not set or is placeholder for ${planKey}. Using mock subscription.`);
        // For development, allow mock subscriptions
        return 'mock_plan_id';
      }

      // Cache the result
      this.planCache.set(planKey, card.paypalPlanId);
      return card.paypalPlanId;
    } catch (error) {
      console.error('❌ Error fetching PayPal plan ID:', error);
      return 'mock_plan_id';
    }
  }

  async renderPayPalButton(planKey: string, container: HTMLElement): Promise<void> {
    await this.loadPayPalScript();

    return new Promise(async (resolve, reject) => {
      try {
        // Check if button is already rendered
        if (container.children.length > 0) {
          resolve();
          return;
        }

        const planId = await this.getPayPalPlanId(planKey);
        
        // For development with mock plans, show a custom button
        if (planId === 'mock_plan_id') {
          container.innerHTML = `
            <button 
              onclick="window.dispatchEvent(new CustomEvent('paypal-subscription-success', {detail: {subscriptionId: 'sub_${Date.now()}', planKey: '${planKey}', result: {}}}))"
              style="
                background: #0070ba;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-bottom: 10px;
              "
            >
              🧪 Test Subscription (Mock Plan)
            </button>
            <p style="font-size: 12px; color: #666; text-align: center;">
              This is a test button for mock plans. Real PayPal plans will show the actual PayPal button.
            </p>
          `;
          resolve();
          return;
        }
        
        this.paypal.Buttons({
          createSubscription: (data: unknown, actions: PayPalActions) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async (data: unknown, actions: PayPalActions) => {
            try {
              // Get subscription details
              const subscription = await actions.subscription.get();
              
              // Confirm subscription with our backend
              const response = await fetch(`${API_URL}/api/subscribe/confirm`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                  paypalSubscriptionId: subscription.id,
                  planKey: planKey,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to confirm subscription');
              }

              const result = await response.json();
              
              // Trigger success callback with subscription details
              const event = new CustomEvent('paypal-subscription-success', {
                detail: {
                  subscriptionId: subscription.id,
                  planKey: planKey,
                  result: result
                }
              });
              window.dispatchEvent(event);
              
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          onError: (err: unknown) => {
            reject(err);
          },
        }).render(container);
      } catch (error) {
        reject(error);
      }
    });
  }

  async createSubscription(planData: PayPalSubscriptionData): Promise<string> {
    await this.loadPayPalScript();

    return new Promise(async (resolve, reject) => {
      try {
        const planId = await this.getPayPalPlanId(planData.planKey);
        
        this.paypal.Buttons({
          createSubscription: (data: unknown, actions: PayPalActions) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async (data: unknown, actions: PayPalActions) => {
            try {
              // Get subscription details
              const subscription = await actions.subscription.get();
              
              // Confirm subscription with our backend
              const response = await fetch(`${API_URL}/api/subscribe/confirm`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                  paypalSubscriptionId: subscription.id,
                  planKey: planData.planKey,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to confirm subscription');
              }

              await response.json();
              resolve(subscription.id);
            } catch (error) {
              reject(error);
            }
          },
          onError: (err: unknown) => {
            reject(err);
          },
        }).render('#paypal-button-container');
      } catch (error) {
        reject(error);
      }
    });
  }

  async createSubscriptionWithRedirect(planData: PayPalSubscriptionData): Promise<string> {
    await this.loadPayPalScript();

    return new Promise(async (resolve, reject) => {
      try {
        const planId = await this.getPayPalPlanId(planData.planKey);
        
        this.paypal.Buttons({
          createSubscription: (data: unknown, actions: PayPalActions) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async (data: unknown, actions: PayPalActions) => {
            try {
              const subscription = await actions.subscription.get();
              resolve(subscription.id);
            } catch (error) {
              reject(error);
            }
          },
          onError: (err: unknown) => {
            reject(err);
          },
        }).render('#paypal-button-container');
      } catch (error) {
        reject(error);
      }
    });
  }

  async renderPayPalPaymentButton(paymentData: PayPalPaymentData, container: HTMLElement): Promise<void> {
    await this.loadPayPalPaymentScript();

    return new Promise(async (resolve, reject) => {
      try {
        // Check if button is already rendered
        if (container.children.length > 0) {
          resolve();
          return;
        }

        // Only show test button if PayPal credentials are not properly configured
        if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'your_sandbox_paypal_client_id' || PAYPAL_CLIENT_ID === 'your_production_paypal_client_id') {
          container.innerHTML = `
            <button 
              onclick="window.dispatchEvent(new CustomEvent('paypal-payment-success', {detail: {orderId: '${paymentData.orderId}', paymentId: 'pay_${Date.now()}', result: {}}}))"
              style="
                background: #0070ba;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-bottom: 10px;
              "
            >
              🧪 Test Payment $${paymentData.amount} (No PayPal Credentials)
            </button>
            <p style="font-size: 12px; color: #666; text-align: center;">
              Set up PayPal credentials to see the real PayPal button.
            </p>
          `;
          resolve();
          return;
        }
        
        this.paypal.Buttons({
          createOrder: (data: unknown, actions: PayPalActions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: paymentData.amount.toFixed(2),
                  currency_code: paymentData.currency
                },
                description: paymentData.description
              }]
            });
          },
          onApprove: async (data: { orderID: string }, actions: PayPalActions) => {
            try {
              // Capture the payment
              const captureResult = await actions.order.capture(data.orderID);
              
              // Update order payment status with our backend
              const response = await fetch(`${API_URL}/api/orders/orders/${paymentData.orderId}/payment-status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                  paymentStatus: 'completed',
                  paypalOrderId: data.orderID,
                  paypalPaymentId: captureResult.id,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update payment status');
              }

              const result = await response.json();
              
              // Trigger success callback with payment details
              const event = new CustomEvent('paypal-payment-success', {
                detail: {
                  orderId: paymentData.orderId,
                  paymentId: captureResult.id,
                  result: result
                }
              });
              window.dispatchEvent(event);
              
              resolve();
            } catch (error) {
              reject(error);
            }
          },

          onError: (err: unknown) => {
            // Handle payment errors
            const event = new CustomEvent('paypal-payment-error', {
              detail: {
                orderId: paymentData.orderId,
                error: err
              }
            });
            window.dispatchEvent(event);
            reject(err);
          },
        }).render(container);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const paypalService = PayPalService.getInstance(); 