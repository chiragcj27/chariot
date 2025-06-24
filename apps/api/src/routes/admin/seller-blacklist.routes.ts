import express from 'express';
import {
  blacklistSeller,
  removeFromBlacklist,
  getBlacklistedSellers,
  handleSellerReapplication,
  getBlacklistStats,
} from '../../controllers/admin/seller-blacklist.controller';

const router = express.Router();

// Get blacklist statistics
router.get('/stats', getBlacklistStats);

// Get all blacklisted sellers
router.get('/', getBlacklistedSellers);

// Blacklist a seller
router.post('/:sellerId/blacklist', blacklistSeller);

// Remove seller from blacklist
router.post('/:sellerId/remove', removeFromBlacklist);

// Handle seller reapplication
router.post('/:sellerId/reapply', handleSellerReapplication);

export default router; 