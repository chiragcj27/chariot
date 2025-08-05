import { Request, Response } from 'express';
import { User, Seller } from '@chariot/db';
import { comparePassword, generateTokens, refreshTokens, verifyAccessToken } from '@chariot/auth';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check approval status for sellers
    if (user.role === 'seller') {
      if (user.approvalStatus === 'pending') {
        return res.status(403).json({
          message: 'Your account is pending approval. Please wait for admin approval.',
          approvalStatus: 'pending',
        });
      }

      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({
          message: 'Your account has been rejected. Please contact support for more information.',
          approvalStatus: 'rejected',
          rejectionReason: user.rejectionReason,
        });
      }
    }

    const tokens = await generateTokens(user);
    // Return user info and tokens (omit password)
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
      ...tokens,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required.' });
  }
  try {
    const tokens = await refreshTokens(refreshToken);
    return res.json(tokens);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);
    
    // Get full user data
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        approvalStatus: user.approvalStatus,
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
} 