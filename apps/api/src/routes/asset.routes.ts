import { Router } from "express";
import { assetController } from "../controllers/asset.controller";
import { isAdminOrSeller } from "../middleware/sellerAuth";

const router : Router = Router();

// Get S3 upload URL
router.post("/upload-url", isAdminOrSeller, assetController.getUploadUrl);
router.delete("/delete", isAdminOrSeller, assetController.deleteAsset);

export default router; 