// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel.js");

// ➕ إضافة أوردر جديد
router.post("/", async (req, res) => {
  try {
    let {
      customerName,
      productName,
      productPrice,
      quantity,
      paperType,
      paperCount,
      paperPrice
    } = req.body;

    // لو القيم دي مش موجودة خليها صفر
    paperCount = Number(paperCount) || 0;
    paperPrice = Number(paperPrice) || 0;

    // حساب تكلفة الطباعة
    const paperTotal = paperCount * paperPrice;

    // حساب الربح = سعر المنتج × الكمية – تكلفة الورق
    const profit = (productPrice * quantity) - paperTotal;

    const newOrder = new Order({
      customerName,
      productName,
      productPrice,
      quantity,
      paperType,
      paperCount,
      paperPrice,
      paperTotal,
      profit
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (err) {
    console.error("❌ خطأ في إضافة أوردر:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📄 عرض كل الأوردرات
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ خطأ في جلب الأوردرات:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏ تعديل أوردر
router.patch("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    let updateData = { ...req.body };

    // لو اتغير الورق احسبه تاني
    if (updateData.paperCount || updateData.paperPrice) {
      const count = Number(updateData.paperCount) || 0;
      const price = Number(updateData.paperPrice) || 0;

      updateData.paperTotal = count * price;

      // حساب الربح الجديد
      if (updateData.productPrice && updateData.quantity) {
        updateData.profit =
          (updateData.productPrice * updateData.quantity) - updateData.paperTotal;
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder)
      return res.status(404).json({ error: "الأوردر مش موجود" });

    res.json(updatedOrder);

  } catch (err) {
    console.error("❌ خطأ في تعديل أوردر:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
