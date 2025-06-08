import { Router } from "express";
import { assetController } from "../controllers/asset.controller";

const router : Router = Router();

// Get S3 upload URL
router.post("/upload-url", assetController.getUploadUrl);


export default router; 