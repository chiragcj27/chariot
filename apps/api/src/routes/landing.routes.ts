import { Router } from 'express';
import { landingController } from '../controllers/landing.controller';

const router: Router = Router();

// Public routes
router.get('/banners', landingController.getBanners);
router.get('/featured-products', landingController.getFeaturedProducts);

router.post('/banners', landingController.createBanner);
router.put('/banners/:id', landingController.updateBanner);
router.delete('/banners/:id', landingController.deleteBanner);

export default router; 