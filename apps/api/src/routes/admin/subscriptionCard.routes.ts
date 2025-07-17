import { Router } from "express";
import {
  createSubscriptionCard,
  updateSubscriptionCard,
  deleteSubscriptionCard,
  getAllSubscriptionCards,
} from "../../controllers/subscriptionCard.controller";

const router = Router();

router.get("/", getAllSubscriptionCards);
router.post("/", createSubscriptionCard);
router.put("/:id", updateSubscriptionCard);
router.delete("/:id", deleteSubscriptionCard);

export default router; 