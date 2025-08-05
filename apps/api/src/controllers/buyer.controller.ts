import { Request, Response } from 'express';
import { User } from '@chariot/db';
import { hashPassword, comparePassword, generateTokens } from '@chariot/auth';

// Buyer registration
export async function registerBuyer(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
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

    // Create buyer user
    const buyer = new User({
      name,
      email,
      password: hashedPassword,
      role: 'buyer',
      approvalStatus: 'approved', // Buyers are auto-approved
      credits: 0, // Start with 0 credits
    });

    await buyer.save();

    res.status(201).json({
      message: 'Buyer registration successful.',
      user: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        role: buyer.role,
        credits: buyer.credits,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // Find buyer by email
    const buyer = await User.findOne({ email, role: 'buyer' });
    if (!buyer) {
      return res.status(401).json({
        message: 'Invalid credentials.',
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

// Update buyer profile
export async function updateBuyerProfile(req: Request, res: Response) {
  try {
    const { name, email } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required.',
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already taken by another user.',
      });
    }

    // Update buyer profile
    const updatedBuyer = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );

    if (!updatedBuyer) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedBuyer._id,
        email: updatedBuyer.email,
        name: updatedBuyer.name,
        role: updatedBuyer.role,
        credits: updatedBuyer.credits,
      },
    });
  } catch (error) {
    console.error('Buyer profile update error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
} 