import { Router } from 'express';
import { marketplaceService } from '../services/marketplace.service';
import { isAdminOrSeller } from '../middleware/sellerAuth';
import { isAdmin } from '../middleware/adminAuth';
import { Sale, SaleStatus } from '@chariot/db';

const router: Router = Router();

// Get marketplace settings (admin only)
router.get('/settings', isAdmin, async (req, res) => {
  try {
    const settings = await marketplaceService['getSettings']();
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching marketplace settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update marketplace settings (admin only)
router.put('/settings', isAdmin, async (req, res) => {
  try {
    const updatedSettings = await marketplaceService.updateMarketplaceSettings(req.body);
    res.json({ settings: updatedSettings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating marketplace settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate SKU for product
router.post('/generate-sku', isAdminOrSeller, async (req, res) => {
  try {
    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const sku = await marketplaceService.generateSku(productName, userId);
    res.json({ sku });
  } catch (error) {
    console.error('Error generating SKU:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get seller sales statistics
router.get('/seller/stats/:sellerId', isAdminOrSeller, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { period = 'month' } = req.query;
    
    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    
    // Check if user is admin or the seller themselves
    if (req.user?.role !== 'admin' && req.user?.userId !== sellerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await marketplaceService.getSellerSalesStats(sellerId, period as any);
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin marketplace statistics
router.get('/admin/stats', isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const stats = await marketplaceService.getAdminMarketplaceStats(period as any);
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get seller-wise sales analytics (admin only)
router.get('/admin/seller-analytics', isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const analytics = await marketplaceService.getSellerWiseSalesAnalytics(period as any);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching seller-wise analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get seller notifications
router.get('/seller/notifications/:sellerId', isAdminOrSeller, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { limit = 20 } = req.query;
    
    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    
    // Check if user is admin or the seller themselves
    if (req.user?.role !== 'admin' && req.user?.userId !== sellerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notifications = await marketplaceService.getSellerNotifications(sellerId, Number(limit));
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching seller notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin notifications
router.get('/admin/notifications/:adminId', isAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    const { limit = 20 } = req.query;
    
    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    
    // Check if user is admin and accessing their own notifications
    if (req.user?.userId !== adminId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notifications = await marketplaceService.getAdminNotifications(adminId, Number(limit));
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', isAdminOrSeller, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }
    
    await marketplaceService.markNotificationAsRead(notificationId);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sales by SKU
router.get('/sales/sku/:sku', isAdmin, async (req, res) => {
  try {
    const { sku } = req.params;
    
    if (!sku) {
      return res.status(400).json({ message: 'SKU is required' });
    }
    
    // Only admins can view sales by SKU
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sales = await marketplaceService.getSalesBySku(sku);
    res.json({ sales });
  } catch (error) {
    console.error('Error fetching sales by SKU:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get seller sales history
router.get('/seller/sales/:sellerId', isAdminOrSeller, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, period } = req.query;
    
    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    
    // Determine which sellerId to use: admins can query any seller; sellers query their own
    const sellerIdToUse = req.user?.role === 'admin' ? sellerId : req.user?.userId;
    if (!sellerIdToUse) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const startDate = period ? marketplaceService['getStartDate'](period as any) : new Date(0);
    
    const sales = await Sale.find({
      sellerId: sellerIdToUse,
      saleDate: { $gte: startDate },
      status: SaleStatus.COMPLETED,
    })
    .sort({ saleDate: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('buyerId', 'name email');

    const total = await Sale.countDocuments({
      sellerId: sellerIdToUse,
      saleDate: { $gte: startDate },
      status: SaleStatus.COMPLETED,
    });

    res.json({
      sales,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
