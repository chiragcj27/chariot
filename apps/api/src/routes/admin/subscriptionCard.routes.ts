import { Router } from "express";
import {
  createSubscriptionCard,
  updateSubscriptionCard,
  deleteSubscriptionCard,
  getAllSubscriptionCards,
} from "../../controllers/subscriptionCard.controller";
import { isAdmin } from "../../middleware/adminAuth";

const router = Router();

// All routes require admin authentication
router.use(isAdmin);

router.get("/", getAllSubscriptionCards);
router.post("/", createSubscriptionCard);
router.put("/:id", updateSubscriptionCard);
router.delete("/:id", deleteSubscriptionCard);

export default router; 