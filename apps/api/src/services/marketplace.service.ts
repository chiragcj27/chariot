import { 
  Product, 
  Order, 
  User, 
  Seller, 
  MarketplaceSettings, 
  Notification, 
  Sale,
  NotificationType,
  SaleStatus,
  IProduct,
  IOrder,
  ISeller,
  IMarketplaceSettings
} from '@chariot/db';
import { emailService } from './email.service';

export class MarketplaceService {
  private static instance: MarketplaceService;
  private settings: IMarketplaceSettings | null = null;

  private constructor() {}

  public static getInstance(): MarketplaceService {
    if (!MarketplaceService.instance) {
      MarketplaceService.instance = new MarketplaceService();
    }
    return MarketplaceService.instance;
  }

  // Get or create marketplace settings
  private async getSettings(): Promise<IMarketplaceSettings> {
    if (!this.settings) {
      this.settings = await MarketplaceSettings.findOne() || 
        await MarketplaceSettings.create({
          defaultCommissionRate: 5.0,
          defaultTaxRate: 12.5,
          minimumPayoutAmount: 100,
          currency: 'USD',
          siteName: 'Chariot Marketplace',
          contactEmail: 'support@chariot.com',
        });
    }
    return this.settings;
  }

  // Generate SKU for product
  public async generateSku(productName: string, sellerId: string): Promise<string> {
    const prefix = productName.substring(0, 3).toUpperCase();
    const sellerPrefix = sellerId.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${prefix}-${sellerPrefix}-${timestamp}-${random}`;
  }

  // Calculate commission and tax for a product
  public async calculateProductPricing(
    productId: string, 
    basePrice: number,
    sellerId: string
  ): Promise<{
    taxRate: number;
    taxAmount: number;
    commissionRate: number;
    commissionAmount: number;
    sellerEarnings: number;
    platformEarnings: number;
  }> {
    const settings = await this.getSettings();
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Get tax rate (category-specific or default)
    const taxRateMap = settings.taxRates as unknown as Map<string, number>;
    const commissionRateMap = settings.commissionRates as unknown as Map<string, number>;
    const categoryKey = product.categoryId ? String(product.categoryId) : undefined;
    const taxRate = categoryKey
      ? (taxRateMap.get(categoryKey) ?? settings.defaultTaxRate)
      : settings.defaultTaxRate;

    // Get commission rate (seller-specific or default)
    const commissionRate = commissionRateMap.get(sellerId) ?? settings.defaultCommissionRate;

    // Calculate amounts
    const taxAmount = (basePrice * taxRate) / 100;
    const totalWithTax = basePrice + taxAmount;
    const commissionAmount = (totalWithTax * commissionRate) / 100;
    const sellerEarnings = totalWithTax - commissionAmount;
    const platformEarnings = commissionAmount;

    return {
      taxRate,
      taxAmount,
      commissionRate,
      commissionAmount,
      sellerEarnings,
      platformEarnings,
    };
  }

  // Process a sale and create notifications
  public async processSale(orderId: string): Promise<void> {
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      throw new Error('Order not found');
    }

    const settings = await this.getSettings();

    // Process each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        continue;
      }
      
      const seller = await Seller.findById(product.sellerId);
      if (!seller) {
        continue;
      }

      // Calculate pricing
      const pricing = await this.calculateProductPricing(
        product._id.toString(),
        item.unitPrice,
        seller.id
      );

      // Create sale record
      const sale = new Sale({
        orderId: order._id,
        orderNumber: order.orderNumber,
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        sellerId: seller._id,
        sellerName: seller.name,
        buyerId: order.userId,
        buyerName: (order.userId as any).name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.totalPrice,
        taxAmount: pricing.taxAmount * item.quantity,
        totalAmount: (item.totalPrice + pricing.taxAmount) * item.quantity,
        commissionRate: pricing.commissionRate,
        commissionAmount: pricing.commissionAmount * item.quantity,
        sellerEarnings: pricing.sellerEarnings * item.quantity,
        platformEarnings: pricing.platformEarnings * item.quantity,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: SaleStatus.COMPLETED,
        saleDate: new Date(),
        metadata: {
          categoryId: product.categoryId,
          taxRate: pricing.taxRate,
        },
      });

      await sale.save();

      // Create notifications
      await this.createSaleNotifications(sale, settings);
    }
  }

  // Create notifications for a sale
  private async createSaleNotifications(sale: any, settings: IMarketplaceSettings): Promise<void> {
    // Notify seller about the sale
    const sellerNotification = new Notification({
      recipientId: sale.sellerId,
      recipientType: 'seller',
      type: NotificationType.SALE,
      title: 'New Sale!',
      message: `You have a new sale for ${sale.productName} (SKU: ${sale.productSku}). Order #${sale.orderNumber}`,
      orderId: sale.orderId,
      productId: sale.productId,
      sellerId: sale.sellerId,
      buyerId: sale.buyerId,
      metadata: {
        saleAmount: sale.totalAmount,
        commissionAmount: sale.commissionAmount,
        orderNumber: sale.orderNumber,
        productName: sale.productName,
      },
    });

    await sellerNotification.save();

    // Notify admin about the sale
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const adminNotification = new Notification({
        recipientId: admin._id,
        recipientType: 'admin',
        type: NotificationType.SALE,
        title: 'New Marketplace Sale',
        message: `New sale: ${sale.productName} (SKU: ${sale.productSku}) by ${sale.sellerName}. Order #${sale.orderNumber}`,
        orderId: sale.orderId,
        productId: sale.productId,
        sellerId: sale.sellerId,
        buyerId: sale.buyerId,
        metadata: {
          saleAmount: sale.totalAmount,
          commissionAmount: sale.commissionAmount,
          orderNumber: sale.orderNumber,
          productName: sale.productName,
          sellerName: sale.sellerName,
        },
      });

      await adminNotification.save();
    }

    // Send email notifications if enabled
    if (settings.emailNotifications) {
      try {
        // Send email to seller
        const seller = await Seller.findById(sale.sellerId);
        if (seller) {
          await emailService.sendSaleNotification(
            seller.email,
            seller.name,
            sale.productName,
            sale.productSku,
            sale.orderNumber,
            sale.totalAmount,
            sale.commissionAmount,
            sale.sellerEarnings
          );
        }

        // Send email to admin
        for (const admin of adminUsers) {
          await emailService.sendAdminSaleNotification(
            admin.email,
            sale.productName,
            sale.productSku,
            sale.sellerName,
            sale.orderNumber,
            sale.totalAmount,
            sale.commissionAmount
          );
        }
      } catch (error) {
        console.error('Failed to send sale notification emails:', error);
      }
    }
  }

  // Get seller sales statistics
  public async getSellerSalesStats(sellerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    totalEarnings: number;
    orderCount: number;
    averageOrderValue: number;
  }> {
    const startDate = this.getStartDate(period);
    
    const sales = await Sale.find({
      sellerId,
      saleDate: { $gte: startDate },
      status: SaleStatus.COMPLETED,
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCommission = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
    const totalEarnings = sales.reduce((sum, sale) => sum + sale.sellerEarnings, 0);
    const orderCount = new Set(sales.map(sale => sale.orderId.toString())).size;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalSales,
      totalRevenue,
      totalCommission,
      totalEarnings,
      orderCount,
      averageOrderValue,
    };
  }

  // Get admin marketplace statistics
  public async getAdminMarketplaceStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    totalTax: number;
    orderCount: number;
    sellerCount: number;
    productCount: number;
    averageOrderValue: number;
  }> {
    const startDate = this.getStartDate(period);
    
    const sales = await Sale.find({
      saleDate: { $gte: startDate },
      status: SaleStatus.COMPLETED,
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCommission = sales.reduce((sum, sale) => sum + sale.platformEarnings, 0);
    const totalTax = sales.reduce((sum, sale) => sum + sale.taxAmount, 0);
    const orderCount = new Set(sales.map(sale => sale.orderId.toString())).size;
    const sellerCount = new Set(sales.map(sale => sale.sellerId.toString())).size;
    const productCount = new Set(sales.map(sale => sale.productId.toString())).size;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalSales,
      totalRevenue,
      totalCommission,
      totalTax,
      orderCount,
      sellerCount,
      productCount,
      averageOrderValue,
    };
  }

  // Get seller notifications
  public async getSellerNotifications(sellerId: string, limit: number = 20): Promise<any[]> {
    return await Notification.find({
      recipientId: sellerId,
      recipientType: 'seller',
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId', 'orderNumber')
    .populate('productId', 'name sku');
  }

  // Get admin notifications
  public async getAdminNotifications(adminId: string, limit: number = 20): Promise<any[]> {
    return await Notification.find({
      recipientId: adminId,
      recipientType: 'admin',
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId', 'orderNumber')
    .populate('productId', 'name sku')
    .populate('sellerId', 'name email');
  }

  // Mark notification as read
  public async markNotificationAsRead(notificationId: string): Promise<void> {
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'read',
      readAt: new Date(),
    });
  }

  // Update marketplace settings
  public async updateMarketplaceSettings(settings: Partial<IMarketplaceSettings>): Promise<IMarketplaceSettings> {
    const currentSettings = await this.getSettings();
    Object.assign(currentSettings, settings);
    await currentSettings.save();
    this.settings = currentSettings;
    return currentSettings;
  }

  // Get sales by SKU
  public async getSalesBySku(sku: string): Promise<any[]> {
    return await Sale.find({ productSku: sku })
      .sort({ saleDate: -1 })
      .populate('sellerId', 'name email')
      .populate('buyerId', 'name email');
  }

  private getStartDate(period: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}

export const marketplaceService = MarketplaceService.getInstance();
