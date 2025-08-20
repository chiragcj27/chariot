import { Request, Response } from 'express';
import { User, Buyer } from '@chariot/db';
import { hashPassword, comparePassword, generateTokens } from '@chariot/auth';
import { emailService } from '../services/email.service';

// Buyer registration
export async function registerBuyer(req: Request, res: Response) {
  try {
    const {
      companyInformation,
      contactInformation,
      otherInformation,
      isChariotCustomer = false,
      chariotCustomerId
    } = req.body;

    // Validate required fields
    if (!companyInformation || !contactInformation || !otherInformation) {
      return res.status(400).json({
        message: 'Company information, contact information, and other information are required.',
      });
    }

    // Validate company information
    const { name: companyName, address, country, state, zipcode, telephone, websiteUrl } = companyInformation;
    if (!companyName || !address || !country || !state || !zipcode || !telephone || !websiteUrl) {
      return res.status(400).json({
        message: 'All company information fields are required.',
      });
    }

    // Validate contact information
    const { firstName, lastName, position, email, telephone: contactTelephone } = contactInformation;
    if (!firstName || !lastName || !position || !email || !contactTelephone) {
      return res.status(400).json({
        message: 'All contact information fields are required.',
      });
    }

    // Validate other information
    const { primaryMarketSegment, buyingOrganization, TaxId, JBT_id, DUNN } = otherInformation;
    if (!primaryMarketSegment || !buyingOrganization || !TaxId || !JBT_id || !DUNN) {
      return res.status(400).json({
        message: 'All other information fields are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists.',
      });
    }

    // Create buyer user with pending approval
    const buyer = new Buyer({
      email,
      name: `${firstName} ${lastName}`,
      role: 'buyer',
      approvalStatus: 'pending', // Buyers need admin approval
      credits: 0,
      companyInformation,
      contactInformation,
      otherInformation,
      isChariotCustomer,
      chariotCustomerId,
      creditsPoints: 0,
    });

    await buyer.save();

    // Send notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@chariot.com';
      await emailService.sendNewBuyerNotification(
        adminEmail,
        `${firstName} ${lastName}`,
        email,
        companyName
      );
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Buyer registration submitted successfully. Your application is pending admin approval.',
      user: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        role: buyer.role,
        approvalStatus: buyer.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Buyer registration error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Buyer login
export async function loginBuyer(req: Request, res: Response) {
  try {
    const { userAccountId, password } = req.body;

    if (!userAccountId || !password) {
      return res.status(400).json({
        message: 'User Account ID and password are required.',
      });
    }

    // Find buyer by userAccountId
    const buyer = await Buyer.findOne({ userAccountId, role: 'buyer' });
    
    if (!buyer) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    // Check approval status
    if (buyer.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending approval. Please wait for admin approval.',
        approvalStatus: 'pending',
      });
    }

    if (buyer.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: 'Your account has been rejected. Please contact support for more information.',
        approvalStatus: 'rejected',
        rejectionReason: buyer.rejectionReason,
      });
    }

    // Check if buyer has a password (should exist after approval)
    if (!buyer.password) {
      return res.status(401).json({
        message: 'Account not properly set up. Please contact support.',
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, buyer.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    // Generate tokens
    const tokens = await generateTokens(buyer);

    res.json({
      message: 'Login successful.',
      user: {
        id: buyer._id,
        email: buyer.email,
        name: buyer.name,
        role: buyer.role,
        credits: buyer.credits,
        userAccountId: buyer.userAccountId,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Buyer login error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Get buyer profile
export async function getBuyerProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const buyer = await Buyer.findById(userId).select('-password -refreshToken');
    if (!buyer) {
      return res.status(404).json({
        message: 'Buyer not found.',
      });
    }

    res.json({
      buyer,
    });
  } catch (error) {
    console.error('Get buyer profile error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Update buyer profile
export async function updateBuyerProfile(req: Request, res: Response) {
  try {
    const {
      companyInformation,
      contactInformation,
      otherInformation
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    // Build update object - allow partial updates
    const updateData: any = {};
    
    if (companyInformation) {
      // Ensure arrays are properly formatted
      if (companyInformation.telephone && Array.isArray(companyInformation.telephone)) {
        companyInformation.telephone = companyInformation.telephone.filter((tel: string) => tel && tel.trim() !== '');
      }
      if (companyInformation.fax && Array.isArray(companyInformation.fax)) {
        companyInformation.fax = companyInformation.fax.filter((fax: string) => fax && fax.trim() !== '');
      }
      updateData.companyInformation = companyInformation;
    }
    
    if (contactInformation) {
      // Ensure arrays are properly formatted
      if (contactInformation.telephone && Array.isArray(contactInformation.telephone)) {
        contactInformation.telephone = contactInformation.telephone.filter((tel: string) => tel && tel.trim() !== '');
      }
      if (contactInformation.fax && Array.isArray(contactInformation.fax)) {
        contactInformation.fax = contactInformation.fax.filter((fax: string) => fax && fax.trim() !== '');
      }
      updateData.contactInformation = contactInformation;
    }
    
    if (otherInformation) {
      updateData.otherInformation = otherInformation;
    }

    // Update buyer profile
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    if (!updatedBuyer) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      message: 'Profile updated successfully.',
      buyer: updatedBuyer,
    });
  } catch (error) {
    console.error('Buyer profile update error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
} 