import { Request, Response } from "express";
import { SubscriptionCard } from "@chariot/db";

export const getAllSubscriptionCards = async (req: Request, res: Response) => {
  try {
    const cards = await SubscriptionCard.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription cards" });
  }
};

export const createSubscriptionCard = async (req: Request, res: Response) => {
  try {
    const card = new SubscriptionCard(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: "Failed to create subscription card" });
  }
};

export const updateSubscriptionCard = async (req: Request, res: Response) => {
  try {
    const card = await SubscriptionCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: "Failed to update subscription card" });
  }
};

export const deleteSubscriptionCard = async (req: Request, res: Response) => {
  try {
    const card = await SubscriptionCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete subscription card" });
  }
}; 