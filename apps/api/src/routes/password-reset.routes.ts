import express, { Router } from 'express';
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from '../controllers/password-reset.controller';

const router: Router = express.Router();

// Request password reset (send OTP)
router.post('/request', requestPasswordReset);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Reset password with verified OTP
router.post('/reset', resetPassword);

export default router;
