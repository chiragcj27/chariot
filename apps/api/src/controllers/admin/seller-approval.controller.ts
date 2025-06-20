import { Request, Response } from 'express';
import { Seller, User } from '@chariot/db';
import { emailService } from '../../services/email.service';

// Get all pending sellers
export async function getPendingSellers(req: Request, res: Response) {
  try {
    const pendingSellers = await Seller.find({ approvalStatus: 'pending' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      sellers: pendingSellers,
      count: pendingSellers.length,
    });
  } catch (error) {
    console.error('Get pending sellers error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get all sellers with their approval status
export async function getAllSellers(req: Request, res: Response) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const sellers = await Seller.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Seller.countDocuments(filter);

    res.json({
      sellers,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalSellers: total,
        hasNext: skip + sellers.length < total,
        hasPrev: parseInt(page as string) > 1,
      },
    });
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Approve seller
export async function approveSeller(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const adminId = req.user?.id; // Assuming you have user info in request

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    if (seller.approvalStatus === 'approved') {
      return res.status(400).json({
        message: 'Seller is already approved.',
      });
    }

    // Update seller approval status
    seller.approvalStatus = 'approved';
    seller.approvedAt = new Date();
    seller.approvedBy = adminId;
    await seller.save();

    // Send approval email
    try {
      await emailService.sendSellerApprovalEmail(seller.email, seller.name);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    res.json({
      message: 'Seller approved successfully.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus,
        approvedAt: seller.approvedAt,
      },
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Reject seller
export async function rejectSeller(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: 'Rejection reason is required.',
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    if (seller.approvalStatus === 'rejected') {
      return res.status(400).json({
        message: 'Seller is already rejected.',
      });
    }

    // Update seller rejection status
    seller.approvalStatus = 'rejected';
    seller.rejectionReason = reason;
    seller.rejectedAt = new Date();
    seller.rejectedBy = adminId;
    await seller.save();

    // Send rejection email
    try {
      await emailService.sendSellerRejectionEmail(seller.email, seller.name, reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    res.json({
      message: 'Seller rejected successfully.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus,
        rejectionReason: seller.rejectionReason,
        rejectedAt: seller.rejectedAt,
      },
    });
  } catch (error) {
    console.error('Reject seller error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get seller details
export async function getSellerDetails(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    const seller = await Seller.findById(sellerId)
      .select('-password -refreshToken')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    res.json({
      seller,
    });
  } catch (error) {
    console.error('Get seller details error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get seller statistics
export async function getSellerStats(req: Request, res: Response) {
  try {
    const totalSellers = await Seller.countDocuments();
    const pendingSellers = await Seller.countDocuments({ approvalStatus: 'pending' });
    const approvedSellers = await Seller.countDocuments({ approvalStatus: 'approved' });
    const rejectedSellers = await Seller.countDocuments({ approvalStatus: 'rejected' });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await Seller.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      stats: {
        total: totalSellers,
        pending: pendingSellers,
        approved: approvedSellers,
        rejected: rejectedSellers,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
} 