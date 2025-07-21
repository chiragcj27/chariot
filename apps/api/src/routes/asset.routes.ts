import { Router } from "express";
import { assetController } from "../controllers/asset.controller";
import { isAdminOrSeller } from "../middleware/sellerAuth";

const router : Router = Router();

// Get S3 upload URL
router.post("/upload-url", isAdminOrSeller, assetController.getUploadUrl);
// Get S3 upload URL for ZIP files (digital products)
router.post("/upload-zip-url", isAdminOrSeller, assetController.getZipUploadUrl);
// Get download URL for digital products (requires purchase verification)
router.get("/digital-product/:productId/download", assetController.getDigitalProductDownloadUrl);
router.delete("/delete", isAdminOrSeller, assetController.deleteAsset);
// Delete private assets (ZIP files) from private S3 bucket
router.delete("/delete-private", isAdminOrSeller, assetController.deletePrivateAsset);

export default router; 