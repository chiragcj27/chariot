import { Request, Response } from 'express';
import { Order, PaymentMethod, PaymentStatus, OrderStatus, User, Product, Kit, IUser } from '@chariot/db';
import { marketplaceService } from '../services/marketplace.service';

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
    const availableCredits = user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0;
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
      const availableCredits = user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0;
      
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
    } else if (paymentMethod === 'paypal') {
      // PayPal-only payment - no credits used
      creditsUsed = 0;
      creditsAmount = 0;
      paypalAmount = total;
      finalPaymentMethod = PaymentMethod.PAYPAL;
    }

    // Check if user has enough credits for credits-only payment
    if (paymentMethod === 'credits' && (user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0) < total && (user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0) === 0) {
      return res.status(400).json({ 
        message: 'Insufficient credits. Please use PayPal payment.',
        availableCredits: user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0,
        requiredAmount: total
      });
    }

    // Ensure credits are never negative
    creditsUsed = Math.max(0, creditsUsed);
    creditsAmount = Math.max(0, creditsAmount);

    // Generate order number
    const generateOrderNumber = (): string => {
      const date = new Date();
      const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const timePart = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}${String(date.getMilliseconds()).padStart(3, "0")}`;
      const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `ORD-${datePart}-${timePart}-${randomPart}`;
    };

    // Create the order
    const order = new Order({
      orderNumber: generateOrderNumber(),
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

    // Update user credits if credits were used AND payment is completed (no PayPal payment required)
    // For mixed payments, credits will be deducted only after PayPal payment is completed
    if (creditsUsed > 0 && user.role === 'buyer' && paypalAmount === 0) {
      const currentCredits = Number((user as any).creditsPoints) || 0;
      (user as any).creditsPoints = Math.max(0, currentCredits - creditsUsed);
      await user.save();
    }

    // Process marketplace sale if payment is completed
    if (paypalAmount === 0) {
      try {
        await marketplaceService.processSale((order as any)._id.toString());
      } catch (marketplaceError) {
        console.error('Error processing marketplace sale:', marketplaceError);
        // Don't fail the order creation if marketplace processing fails
      }
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
      userCreditsAfter: user.role === 'buyer' ? (user as any).creditsPoints || 0 : 0,
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

    // Only fetch successfully processed orders (PAID status and COMPLETED payment status)
    const orders = await Order.find({ 
      userId,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.COMPLETED
    })
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
      
      // For mixed payments, deduct credits only after PayPal payment is completed
      if (order.paymentMethod === PaymentMethod.MIXED && order.paymentBreakdown.creditsUsed > 0) {
        const user = await User.findById(order.userId);
        if (user && user.role === 'buyer') {
          const currentCredits = Number((user as any).creditsPoints) || 0;
          (user as any).creditsPoints = Math.max(0, currentCredits - order.paymentBreakdown.creditsUsed);
          await user.save();
        }
      }

      // Process marketplace sale when payment is completed
      try {
        console.log('🔄 Processing marketplace sale for order:', order.orderNumber);
        await marketplaceService.processSale((order as any)._id.toString());
        console.log('✅ Marketplace sale processed successfully for order:', order.orderNumber);
      } catch (marketplaceError) {
        console.error('❌ Error processing marketplace sale:', marketplaceError);
        // Don't fail the payment status update if marketplace processing fails
      }
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // For mixed payments that haven't been completed, restore credits
    if (order.paymentMethod === PaymentMethod.MIXED && 
        order.paymentStatus === PaymentStatus.PENDING && 
        order.paymentBreakdown.creditsUsed > 0) {
      const user = await User.findById(userId);
      if (user && user.role === 'buyer') {
        (user as any).creditsPoints += order.paymentBreakdown.creditsUsed;
        await user.save();
      }
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.paymentStatus = PaymentStatus.FAILED;
    await order.save();

    res.json({ 
      message: 'Order cancelled successfully',
      order: order,
      creditsRestored: order.paymentMethod === PaymentMethod.MIXED ? order.paymentBreakdown.creditsUsed : 0
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch all orders including pending ones for order status tracking
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
    console.error('Error getting all user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
