// PayPal SDK types
declare global {
  interface Window {
    paypal: {
      Buttons: (config: PayPalButtonConfig) => { render: (container: string | HTMLElement) => void };
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

interface PayPalActions {
  subscription: {
    create: (params: { plan_id: string }) => Promise<string>;
    get: () => Promise<{ id: string; [key: string]: unknown }>;
  };
}

interface PayPalButtonConfig {
  createSubscription: (data: unknown, actions: PayPalActions) => Promise<string>;
  onApprove: (data: unknown, actions: PayPalActions) => Promise<void>;
  onError: (err: unknown) => void;
}

export class PayPalService {
  private static instance: PayPalService;
  private paypal!: Window['paypal'];
  private planCache: Map<string, string> = new Map();

  private constructor() {
    this.loadPayPalScript();
  }

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  private loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
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
      document.head.appendChild(script);
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
              🧪 Test Subscription (Development)
            </button>
            <p style="font-size: 12px; color: #666; text-align: center;">
              This is a test button. In production, you'll see the real PayPal button.
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
}

export const paypalService = PayPalService.getInstance(); 