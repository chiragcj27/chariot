import express from 'express';
import {
  getPendingBuyers,
  getAllBuyers,
  approveBuyer,
  rejectBuyer,
  getBuyerDetails,
  getBuyerStats,
} from '../../controllers/admin/buyer-approval.controller';
import { isAdmin } from '../../middleware/adminAuth';

const router = express.Router();

// All routes require admin authentication
router.use(isAdmin);

// Get buyer statistics
router.get('/stats', getBuyerStats);

// Get all pending buyers
router.get('/pending', getPendingBuyers);





// Get all buyers with pagination and filtering
router.get('/', getAllBuyers);

// Get specific buyer details
router.get('/:buyerId', getBuyerDetails);

// Approve buyer
router.post('/:buyerId/approve', approveBuyer);

// Reject buyer
router.post('/:buyerId/reject', rejectBuyer);

export default router;
