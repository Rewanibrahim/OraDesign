// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel.js"); // تأكدي إنك عامل/ة orderModel.js

// إضافة أوردر جديد
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// عرض كل الأوردرات
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// تعديل أوردر موجود
router.patch("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ error: "الأوردر مش موجود" });
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
