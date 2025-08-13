import { Router } from "express";
import { fileController } from "../controllers/file.controller";
import { isSeller } from "../middleware/sellerAuth";

const router: Router = Router();

// Store kit preview file metadata (public bucket)
router.post("/kit-preview-files", isSeller, fileController.storeKitPreviewFile);

// Store kit main file metadata (private bucket)
router.post("/kit-main-files", isSeller, fileController.storeKitMainFile);

// Get kit files for a product
router.get("/kit-files/:productId", isSeller, fileController.getKitFiles);

// Delete a kit file
router.delete("/kit-files/:fileId/:productId", isSeller, fileController.deleteKitFile);

// Get kit main file download URL (requires purchase verification)
router.get("/kit-main-file/:productId/download", fileController.getKitMainFileDownloadUrl);

export default router; 