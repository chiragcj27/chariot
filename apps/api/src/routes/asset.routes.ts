import { Router } from "express";
import { assetController } from "../controllers/asset.controller";
import { isSeller } from "../middleware/sellerAuth";

const router : Router = Router();

// Get S3 upload URL
router.post("/upload-url", isSeller, assetController.getUploadUrl);
router.delete("/delete", isSeller, assetController.deleteAsset);

export default router; 