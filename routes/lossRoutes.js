import express from "express";
import Loss from "../models/lossModel.js";

const router = express.Router();

// إضافة خسارة جديدة
router.post("/", async (req, res) => {
  try {
    const { name, amount } = req.body;
    const newLoss = new Loss({ name, amount });
    await newLoss.save();
    res.status(201).json(newLoss);
  } catch (error) {
    res.status(500).json({ message: "Error adding loss", error });
  }
});

// جلب كل الخسائر
router.get("/", async (req, res) => {
  try {
    const losses = await Loss.find().sort({ date: -1 });
    res.json(losses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching losses", error });
  }
});

export default router;
