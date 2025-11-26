import express from "express";
import OrderTest from "../models/orderModel.js"; // الموديل الجديد

const router = express.Router();

// POST /api/test-order
router.post("/", async (req, res) => {
  try {
    const order = new OrderTest(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET كل الأوردرات
router.get("/", async (req, res) => {
  try {
    const all = await OrderTest.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH لتحديث أوردر
router.patch("/:id", async (req, res) => {
  try {
    const updated = await OrderTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
