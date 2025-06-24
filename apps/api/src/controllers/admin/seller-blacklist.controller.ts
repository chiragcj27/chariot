import { Request, Response } from 'express';
import { Seller, Product, ISeller, User } from '@chariot/db';
import { emailService } from '../../services/email.service';
import { Document } from 'mongoose';

// Blacklist a seller
export async function blacklistSeller(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const { reason, expiryDate } = req.body;
    const adminId = req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: 'Blacklist reason is required.',
      });
    }

    const seller = await Seller.findById(sellerId) as ISeller & Document;
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    if (seller.isBlacklisted) {
      return res.status(400).json({
        message: 'Seller is already blacklisted.',
      });
    }

    // Calculate expiry date (default to 30 days if not provided)
    let blacklistExpiryDate;
    if (expiryDate) {
      blacklistExpiryDate = new Date(expiryDate);
    } else {
      blacklistExpiryDate = new Date();
      blacklistExpiryDate.setDate(blacklistExpiryDate.getDate() + 30);
    }

    // Update seller blacklist status
    seller.isBlacklisted = true;
    seller.blacklistReason = reason;
    seller.blacklistedAt = new Date();
    seller.blacklistedBy = adminId;
    seller.blacklistExpiryDate = blacklistExpiryDate;
    await seller.save();

    // Deactivate all seller's products
    await Product.updateMany(
      { sellerId: sellerId },
      { 
        status: 'inactive',
        updatedAt: new Date()
      }
    );

    // Send blacklist notification email
    try {
      await emailService.sendSellerBlacklistEmail(
        seller.email, 
        seller.name, 
        reason, 
        blacklistExpiryDate
      );
    } catch (emailError) {
      console.error('Failed to send blacklist email:', emailError);
      // Don't fail the blacklist if email fails
    }

    res.json({
      message: 'Seller blacklisted successfully.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        isBlacklisted: seller.isBlacklisted,
        blacklistReason: seller.blacklistReason,
        blacklistedAt: seller.blacklistedAt,
        blacklistExpiryDate: seller.blacklistExpiryDate,
      },
    });
  } catch (error) {
    console.error('Blacklist seller error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Remove seller from blacklist
export async function removeFromBlacklist(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const adminId = req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    const seller = await Seller.findById(sellerId) as ISeller & Document;
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    if (!seller.isBlacklisted) {
      return res.status(400).json({
        message: 'Seller is not blacklisted.',
      });
    }

    // Remove blacklist status
    seller.isBlacklisted = false;
    seller.blacklistReason = undefined;
    seller.blacklistedAt = undefined;
    seller.blacklistedBy = undefined;
    seller.blacklistExpiryDate = undefined;
    seller.reapplicationDate = undefined;
    seller.reapplicationReason = undefined;
    await seller.save();

    // Reactivate all seller's products (only if they were previously active)
    await Product.updateMany(
      { 
        sellerId: sellerId,
        status: 'inactive'
      },
      { 
        status: 'active',
        updatedAt: new Date()
      }
    );

    // Send removal notification email
    try {
      await emailService.sendSellerBlacklistRemovalEmail(seller.email, seller.name);
    } catch (emailError) {
      console.error('Failed to send blacklist removal email:', emailError);
      // Don't fail the removal if email fails
    }

    res.json({
      message: 'Seller removed from blacklist successfully.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        isBlacklisted: seller.isBlacklisted,
      },
    });
  } catch (error) {
    console.error('Remove from blacklist error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get blacklisted sellers
export async function getBlacklistedSellers(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const blacklistedSellers = await Seller.find({ isBlacklisted: true })
      .select('-password -refreshToken')
      .populate('blacklistedBy', 'name email')
      .sort({ blacklistedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Seller.countDocuments({ isBlacklisted: true });

    res.json({
      sellers: blacklistedSellers,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalSellers: total,
        hasNext: skip + blacklistedSellers.length < total,
        hasPrev: parseInt(page as string) > 1,
      },
    });
  } catch (error) {
    console.error('Get blacklisted sellers error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Handle seller reapplication
export async function handleSellerReapplication(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const { reapplicationReason } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    if (!reapplicationReason) {
      return res.status(400).json({
        message: 'Reapplication reason is required.',
      });
    }

    const seller = await Seller.findById(sellerId) as ISeller & Document;
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    if (!seller.isBlacklisted) {
      return res.status(400).json({
        message: 'Seller is not blacklisted.',
      });
    }

    // Update reapplication details
    seller.reapplicationDate = new Date();
    seller.reapplicationReason = reapplicationReason;
    await seller.save();

    // Send notification to admin
    try {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await emailService.sendSellerReapplicationNotification(
          admin.email,
          seller.name,
          seller.email,
          reapplicationReason
        );
      }
    } catch (emailError) {
      console.error('Failed to send reapplication notification:', emailError);
      // Don't fail the reapplication if email fails
    }

    res.json({
      message: 'Reapplication submitted successfully. Admin will review your request.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        reapplicationDate: seller.reapplicationDate,
        reapplicationReason: seller.reapplicationReason,
      },
    });
  } catch (error) {
    console.error('Handle reapplication error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get blacklist statistics
export async function getBlacklistStats(req: Request, res: Response) {
  try {
    const totalBlacklisted = await Seller.countDocuments({ isBlacklisted: true });
    const totalSellers = await Seller.countDocuments({ role: 'seller' });
    const pendingReapplications = await Seller.countDocuments({ 
      isBlacklisted: true, 
      reapplicationDate: { $exists: true } 
    });

    // Get sellers with expired blacklist
    const expiredBlacklist = await Seller.countDocuments({
      isBlacklisted: true,
      blacklistExpiryDate: { $lt: new Date() }
    });

    res.json({
      stats: {
        totalBlacklisted,
        totalSellers,
        blacklistPercentage: totalSellers > 0 ? (totalBlacklisted / totalSellers * 100).toFixed(2) : 0,
        pendingReapplications,
        expiredBlacklist,
      },
    });
  } catch (error) {
    console.error('Get blacklist stats error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
} 