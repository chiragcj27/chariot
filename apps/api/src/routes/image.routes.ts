import { Router } from "express";
import { imageController } from "../controllers/image.controller";

const router : Router = Router();

// Get S3 upload URL
router.post("/upload-url", imageController.getUploadUrl);


export default router; 