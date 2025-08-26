import { Request, Response } from 'express';
import { Order, PaymentMethod, PaymentStatus, OrderStatus, User, Product, Kit } from '@chariot/db';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CartItem[];
  paymentMethod: 'credits' | 'paypal';
}

interface CheckoutResponse {
  order: any;
  paymentBreakdown: {
    creditsUsed: number;
    creditsAmount: number;
    paypalAmount: number;
    totalAmount: number;
  };
  userCreditsAfter: number;
  requiresPayPalPayment: boolean;
}

export const getCheckoutInfo = async (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items: CartItem[] };
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Basic request validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid request: items must be a non-empty array' });
    }
    for (const item of items) {
      if (!item || typeof item.productId !== 'string' || item.productId.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid request: each item must include a valid productId' });
      }
      if (typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Invalid request: each item must include a positive quantity' });
      }
    }

    // Get user and their credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get products and kits and calculate totals
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate('images');
    const kits = await Kit.find({ _id: { $in: productIds } });

    let subtotal = 0;
    let totalCreditsCost = 0;
    const orderItems = [];

    for (const item of items) {
      // Check if it's a product
      let product = products.find((p: any) => p._id.toString() === item.productId);
      let kit = null;
      
      // If not a product, check if it's a kit
      if (!product) {
        kit = kits.find((k: any) => k._id.toString() === item.productId);
        if (!kit) {
          return res.status(404).json({ message: `Product/Kit ${item.productId} not found` });
        }
      }

      let unitPrice = 0;
      let unitCreditsCost = 0;
      let productName = '';
      let productSlug = '';
      let imageUrl = '';

      if (product) {
        // Handle product
        unitPrice = product.price?.amount || 0;
        unitCreditsCost = product.creditsCost || 0;
        productName = product.name || '';
        productSlug = product.slug || '';
        // Get the first image URL from populated images
        const firstImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
        imageUrl = firstImage && typeof firstImage === 'object' && 'url' in firstImage ? String(firstImage.url) : '';
      } else if (kit) {
        // Handle kit - use mock pricing for now
        unitPrice = 80; // Mock price for kits
        unitCreditsCost = 80; // Mock credits cost for kits
        productName = kit.title || '';
        productSlug = kit.slug || '';
        imageUrl = (kit.mainImage as any)?.url || (kit.thumbnail as any)?.url || '';
      }

      const totalPrice = unitPrice * item.quantity;
      const totalCreditsCostForItem = unitCreditsCost * item.quantity;

      subtotal += totalPrice;
      totalCreditsCost += totalCreditsCostForItem;

      orderItems.push({
        productId: product?._id || kit?._id,
        productName,
        productSlug,
        quantity: item.quantity,
        unitPrice,
        unitCreditsCost,
        totalPrice,
        totalCreditsCost: totalCreditsCostForItem,
        imageUrl: imageUrl || '',
      });
    }

    const tax = subtotal * 0.125; // 12.5% tax rate
    const total = subtotal + tax;

    // Calculate payment breakdown (1 credit = 1 dollar)
    const availableCredits = user.credits;
    const creditsToUse = Math.min(availableCredits, total);
    const creditsAmount = creditsToUse;
    const paypalAmount = total - creditsAmount;

    const response = {
      orderItems,
      subtotal,
      tax,
      total,
      userCredits: availableCredits,
      paymentBreakdown: {
        creditsUsed: creditsToUse,
        creditsAmount,
        paypalAmount,
        totalAmount: total,
      },
      canPayWithCredits: availableCredits >= total,
      requiresPayPalPayment: paypalAmount > 0,
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting checkout info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod } = req.body as CheckoutRequest;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Basic request validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid request: items must be a non-empty array' });
    }
    if (paymentMethod !== 'credits' && paymentMethod !== 'paypal') {
      return res.status(400).json({ message: 'Invalid request: paymentMethod must be "credits" or "paypal"' });
    }
    for (const item of items) {
      if (!item || typeof item.productId !== 'string' || item.productId.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid request: each item must include a valid productId' });
      }
      if (typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Invalid request: each item must include a positive quantity' });
      }
    }

    // Get user and their credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get products and kits and calculate totals
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate('images');
    const kits = await Kit.find({ _id: { $in: productIds } });

    let subtotal = 0;
    let totalCreditsCost = 0;
    const orderItems = [];

    for (const item of items) {
      // Check if it's a product
      let product = products.find((p: any) => p._id.toString() === item.productId);
      let kit = null;
      
      // If not a product, check if it's a kit
      if (!product) {
        kit = kits.find((k: any) => k._id.toString() === item.productId);
        if (!kit) {
          return res.status(404).json({ message: `Product/Kit ${item.productId} not found` });
        }
      }

      let unitPrice = 0;
      let unitCreditsCost = 0;
      let productName = '';
      let productSlug = '';
      let imageUrl = '';

      if (product) {
        // Handle product
        unitPrice = product.price?.amount || 0;
        unitCreditsCost = product.creditsCost || 0;
        productName = product.name || '';
        productSlug = product.slug || '';
        // Get the first image URL from populated images
        const firstImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
        imageUrl = firstImage && typeof firstImage === 'object' && 'url' in firstImage ? String(firstImage.url) : '';
      } else if (kit) {
        // Handle kit - use mock pricing for now
        unitPrice = 80; // Mock price for kits
        unitCreditsCost = 80; // Mock credits cost for kits
        productName = kit.title || '';
        productSlug = kit.slug || '';
        imageUrl = (kit.mainImage as any)?.url || (kit.thumbnail as any)?.url || '';
      }

      const totalPrice = unitPrice * item.quantity;
      const totalCreditsCostForItem = unitCreditsCost * item.quantity;

      subtotal += totalPrice;
      totalCreditsCost += totalCreditsCostForItem;

      orderItems.push({
        productId: product?._id || kit?._id,
        productName,
        productSlug,
        quantity: item.quantity,
        unitPrice,
        unitCreditsCost,
        totalPrice,
        totalCreditsCost: totalCreditsCostForItem,
        imageUrl: imageUrl || '',
      });
    }

    const tax = subtotal * 0.125; // 12.5% tax rate
    const total = subtotal + tax;

    // Calculate payment breakdown based on payment method
    let creditsUsed = 0;
    let creditsAmount = 0;
    let paypalAmount = total;
    let finalPaymentMethod = PaymentMethod.PAYPAL;

    if (paymentMethod === 'credits') {
      const availableCredits = user.credits;
      
      // If user has enough credits, use all credits
      if (availableCredits >= total) {
        creditsUsed = total;
        creditsAmount = total;
        paypalAmount = 0;
        finalPaymentMethod = PaymentMethod.CREDITS;
      } else {
        // If user doesn't have enough credits, use all available credits and pay remaining with PayPal
        creditsUsed = availableCredits;
        creditsAmount = availableCredits;
        paypalAmount = total - availableCredits;
        finalPaymentMethod = PaymentMethod.MIXED;
      }
    }

    // Check if user has enough credits for credits-only payment
    if (paymentMethod === 'credits' && user.credits < total && user.credits === 0) {
      return res.status(400).json({ 
        message: 'Insufficient credits. Please use PayPal payment.',
        availableCredits: user.credits,
        requiredAmount: total
      });
    }

    // Create the order
    const order = new Order({
      userId,
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod: finalPaymentMethod,
      paymentStatus: paypalAmount > 0 ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
      paymentBreakdown: {
        creditsUsed,
        creditsAmount,
        paypalAmount,
        totalAmount: total,
      },
      status: paypalAmount > 0 ? OrderStatus.PENDING : OrderStatus.PAID,
    });

    await order.save();

    // Update user credits if credits were used
    if (creditsUsed > 0) {
      user.credits -= creditsUsed;
      await user.save();
    }

    const response: CheckoutResponse = {
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt,
      },
      paymentBreakdown: order.paymentBreakdown,
      userCreditsAfter: user.credits,
      requiresPayPalPayment: paypalAmount > 0,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name slug images type isKitProduct');

    // Get all product IDs that didn't get populated (likely kits)
    const unpopulatedIds: string[] = [];
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!item.productId || typeof item.productId === 'string') {
          unpopulatedIds.push(item.productId);
        }
      });
    });

    // Fetch kits for unpopulated IDs
    let kitMap = new Map<string, any>();
    if (unpopulatedIds.length > 0) {
      const kits = await Kit.find({ _id: { $in: unpopulatedIds } });
      kitMap = new Map(kits.map(k => [k._id.toString(), k]));
    }

    // Transform the orders to ensure productId is a string and include productInfo
    const transformedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        items: orderObj.items.map((item: any) => {
          const productId = item.productId._id || item.productId.toString();
          
          let productInfo = null;
          if (item.productId && typeof item.productId === 'object') {
            // This is a populated product
            productInfo = {
              type: item.productId.type,
              isKitProduct: item.productId.isKitProduct,
              name: item.productId.name,
              slug: item.productId.slug
            };
          } else {
            // This might be a kit - check if we have kit data
            const kit = kitMap.get(productId);
            if (kit) {
              productInfo = {
                type: 'digital', // Kits are downloadable
                isKitProduct: true, // Kits are kit products
                name: kit.title,
                slug: kit.slug
              };
            }
          }

          return {
            ...item,
            productId,
            productInfo
          };
        })
      };
    });

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId', 'name slug images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paypalOrderId, paypalPaymentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (paypalOrderId) order.paypalOrderId = paypalOrderId;
    if (paypalPaymentId) order.paypalPaymentId = paypalPaymentId;

    if (paymentStatus === PaymentStatus.COMPLETED) {
      order.status = OrderStatus.PAID;
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
