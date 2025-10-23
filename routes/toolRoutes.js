const express = require("express");
const router = express.Router();
const Tool = require("../models/toolModel.js");

// GET /api/tools → جلب كل الأدوات
router.get("/", async (req, res) => {
  try {
    const tools = await Tool.find();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tools → إضافة أداة جديدة
router.post("/", async (req, res) => {
  const { name, cost, quantity } = req.body;
  if (!name || !cost || !quantity) return res.status(400).json({ message: "Values required" });

  try {
    const newTool = new Tool({ name, cost, quantity });
    await newTool.save();
    res.json(newTool);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
