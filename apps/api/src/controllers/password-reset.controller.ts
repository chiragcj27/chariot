import { Request, Response } from 'express';
import { User, Buyer, Seller, OTP } from '@chariot/db';
import { hashPassword } from '@chariot/auth';
import { emailService } from '../services/email.service';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request password reset (send OTP)
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required.',
      });
    }

    // Find user by email (check both Buyer and Seller collections)
    let user = await Buyer.findOne({ email });
    if (!user) {
      user = await Seller.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email address.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: 'password_reset' });

    // Create new OTP
    const otpRecord = new OTP({
      email,
      otp,
      type: 'password_reset',
      expiresAt,
      isUsed: false,
    });

    await otpRecord.save();

    // Send OTP email
    try {
      await emailService.sendPasswordResetOTP(email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.json({
      message: 'Password reset OTP has been sent to your email address.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Verify OTP
export async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required.',
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP.',
      });
    }

    // Don't mark as used yet - we'll mark it as used when password is actually reset
    // This allows the OTP to be used for the password reset step

    res.json({
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}

// Reset password with verified OTP
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: 'Email, OTP, and new password are required.',
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Verify OTP again (in case it was used in a different request)
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP.',
      });
    }

    // Find user by email
    let user = await Buyer.findOne({ email });
    if (!user) {
      user = await Seller.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email address.',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.json({
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'Internal server error.',
    });
  }
}
