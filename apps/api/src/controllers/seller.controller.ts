import { Request, Response } from 'express';
import { User, Seller, Admin } from '@chariot/db';
import { hashPassword, comparePassword, generateTokens } from '@chariot/auth';
import { emailService } from '../services/email.service';

// Seller registration
export async function registerSeller(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      password,
      storeDetails,
      commissionRate = 5, // Default commission rate
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !storeDetails) {
      return res.status(400).json({
        message: 'Name, email, password, and store details are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create seller with pending approval status
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      approvalStatus: 'pending',
      storeDetails,
      commissionRate,
      products: [],
      orders: [],
      sales: [],
    });

    await seller.save();

    // Send notification to admin (optional)
    try {
      const adminUsers = await Admin.find({});
      for (const admin of adminUsers) {
        await emailService.sendNewSellerNotification(
          admin.email,
          name,
          email
        );
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Seller registration successful. Awaiting admin approval.',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Seller registration error:', error);
    res.status(500).json({
      message: 'Internal server error during registration.',
    });
  }
}

// Seller login with approval check
export async function loginSeller(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // Find seller by email
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, seller.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    // Check approval status
    if (seller.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending approval. Please wait for admin approval.',
        approvalStatus: 'pending',
      });
    }

    if (seller.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: 'Your account has been rejected. Please contact support for more information.',
        approvalStatus: 'rejected',
        rejectionReason: seller.rejectionReason,
      });
    }

    // Generate tokens
    const tokens = await generateTokens(seller);

    res.json({
      message: 'Login successful.',
      user: {
        id: seller._id,
        email: seller.email,
        name: seller.name,
        role: seller.role,
        approvalStatus: seller.approvalStatus,
        storeDetails: seller.storeDetails,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({
      message: 'Internal server error during login.',
    });
  }
}

// Get seller profile
export async function getSellerProfile(req: Request, res: Response) {
  try {
    const sellerId = req.params.id || req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    const seller = await Seller.findById(sellerId).select('-password -refreshToken');
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    res.json({
      seller,
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Update seller profile
export async function updateSellerProfile(req: Request, res: Response) {
  try {
    const sellerId = req.params.id || req.user?.id;
    const updateData = req.body;

    if (!sellerId) {
      return res.status(400).json({
        message: 'Seller ID is required.',
      });
    }

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.email; // Email should not be changed via this endpoint
    delete updateData.role;
    delete updateData.approvalStatus;

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).select('-password -refreshToken');

    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found.',
      });
    }

    res.json({
      message: 'Profile updated successfully.',
      seller,
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
} 