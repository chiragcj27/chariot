import { Request, Response } from 'express';
import { Buyer, User } from '@chariot/db';
import { emailService } from '../../services/email.service';
import { generateUserAccountId, generateUniqueUserAccountId, generatePassword } from '../../utils/generateCredentials';
import { hashPassword } from '@chariot/auth';
import { comparePassword } from '@chariot/auth';

// Get all pending buyers
export async function getPendingBuyers(req: Request, res: Response) {
  try {
    const pendingBuyers = await Buyer.find({ approvalStatus: 'pending' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      buyers: pendingBuyers,
      count: pendingBuyers.length,
    });
  } catch (error) {
    console.error('Get pending buyers error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get all buyers with their approval status
export async function getAllBuyers(req: Request, res: Response) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const buyers = await Buyer.find(filter)
      .select('-password -refreshToken')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Buyer.countDocuments(filter);

    res.json({
      buyers,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalBuyers: total,
        hasNext: skip + buyers.length < total,
        hasPrev: parseInt(page as string) > 1,
      },
    });
  } catch (error) {
    console.error('Get all buyers error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Approve buyer
export async function approveBuyer(req: Request, res: Response) {
  try {
    const { buyerId } = req.params;
    const adminId = req.user?.id;

    if (!buyerId) {
      return res.status(400).json({
        message: 'Buyer ID is required.',
      });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        message: 'Buyer not found.',
      });
    }

    if (buyer.approvalStatus === 'approved') {
      return res.status(400).json({
        message: 'Buyer is already approved.',
      });
    }

    // Generate unique userAccountId and password with collision handling
    const userAccountId = await generateUniqueUserAccountId(
      async (id: string) => {
        const existingBuyer = await Buyer.findOne({ userAccountId: id });
        return !!existingBuyer;
      }
    );
    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    // Update buyer approval status and credentials
    buyer.approvalStatus = 'approved';
    buyer.approvedAt = new Date();
    buyer.approvedBy = adminId;
    buyer.userAccountId = userAccountId;
    buyer.password = hashedPassword;
    await buyer.save();



    // Send approval email with credentials
    let emailSent = false;
    try {
      await emailService.sendBuyerApprovalEmail(
        buyer.contactInformation.email,
        buyer.contactInformation.firstName,
        userAccountId,
        password
      );
      emailSent = true;
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    res.json({
      message: emailSent 
        ? 'Buyer approved successfully. Credentials sent via email.' 
        : 'Buyer approved successfully, but email delivery failed. Please check email configuration.',
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.contactInformation.email,
        approvalStatus: buyer.approvalStatus,
        approvedAt: buyer.approvedAt,
        userAccountId: buyer.userAccountId,
      },
      emailSent,
      credentials: emailSent ? null : { userAccountId, password }, // Only show credentials if email failed
    });
  } catch (error) {
    console.error('Approve buyer error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Reject buyer
export async function rejectBuyer(req: Request, res: Response) {
  try {
    const { buyerId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!buyerId) {
      return res.status(400).json({
        message: 'Buyer ID is required.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: 'Rejection reason is required.',
      });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        message: 'Buyer not found.',
      });
    }

    if (buyer.approvalStatus === 'rejected') {
      return res.status(400).json({
        message: 'Buyer is already rejected.',
      });
    }

    // Update buyer rejection status
    buyer.approvalStatus = 'rejected';
    buyer.rejectionReason = reason;
    buyer.rejectedAt = new Date();
    buyer.rejectedBy = adminId;
    await buyer.save();

    // Send rejection email
    try {
      await emailService.sendBuyerRejectionEmail(
        buyer.contactInformation.email,
        buyer.contactInformation.firstName,
        reason
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    res.json({
      message: 'Buyer rejected successfully.',
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.contactInformation.email,
        approvalStatus: buyer.approvalStatus,
        rejectionReason: buyer.rejectionReason,
        rejectedAt: buyer.rejectedAt,
      },
    });
  } catch (error) {
    console.error('Reject buyer error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get buyer details
export async function getBuyerDetails(req: Request, res: Response) {
  try {
    const { buyerId } = req.params;

    if (!buyerId) {
      return res.status(400).json({
        message: 'Buyer ID is required.',
      });
    }

    const buyer = await Buyer.findById(buyerId)
      .select('-password -refreshToken')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!buyer) {
      return res.status(404).json({
        message: 'Buyer not found.',
      });
    }

    res.json({
      buyer,
    });
  } catch (error) {
    console.error('Get buyer details error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get buyer statistics
export async function getBuyerStats(req: Request, res: Response) {
  try {
    const total = await Buyer.countDocuments();
    const pending = await Buyer.countDocuments({ approvalStatus: 'pending' });
    const approved = await Buyer.countDocuments({ approvalStatus: 'approved' });
    const rejected = await Buyer.countDocuments({ approvalStatus: 'rejected' });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await Buyer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      stats: {
        total,
        pending,
        approved,
        rejected,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error('Get buyer stats error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}






