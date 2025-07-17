import { Router } from "express";
import {
  getAllSubscriptionCards,
  createSubscriptionCard,
  updateSubscriptionCard,
  deleteSubscriptionCard,
} from "../controllers/subscriptionCard.controller";

const router = Router();

// Public fetch
router.get("/", getAllSubscriptionCards);

// Admin CRUD
router.post("/admin", createSubscriptionCard);
router.put("/admin/:id", updateSubscriptionCard);
router.delete("/admin/:id", deleteSubscriptionCard);

export default router; 