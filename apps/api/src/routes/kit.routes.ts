import { Router } from "express";
import { kitController } from "../controllers/kit.controller";

const router: Router = Router();

// Create a new kit
router.post("/", kitController.createKit);

// Save kit images
router.post("/images", kitController.saveKitImages);

// Get all kits
router.get("/", kitController.getAllKits);

// Get kit by slug
router.get("/slug/:slug", kitController.getKitBySlug);

// Update kit
router.put("/:kitId", kitController.updateKit);

// Delete kit
router.delete("/:kitId", kitController.deleteKit);


export default router; 