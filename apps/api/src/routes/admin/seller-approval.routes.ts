import express from 'express';
import {
  getPendingSellers,
  getAllSellers,
  approveSeller,
  rejectSeller,
  getSellerDetails,
  getSellerStats,
} from '../../controllers/admin/seller-approval.controller';

const router = express.Router();

// Get pending sellers
router.get('/pending', getPendingSellers);

// Get all sellers with pagination and filtering
router.get('/', getAllSellers);

// Get seller statistics
router.get('/stats', getSellerStats);

// Get specific seller details
router.get('/:sellerId', getSellerDetails);

// Approve seller
router.post('/:sellerId/approve', approveSeller);

// Reject seller
router.post('/:sellerId/reject', rejectSeller);

export default router; 