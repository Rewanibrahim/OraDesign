import dotenv from "dotenv";
dotenv.config(); // مهم جدًا يكون هنا الأول
import express from "express";
import Product from "../models/productModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

const router = express.Router();

// ======== إعداد Cloudinary ========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======== إعداد Multer ========
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==== إضافة منتج (صورة واحدة) ====
router.post("/", upload.single("imageUrl"), async (req, res) => {
  try {
    const { name, sellingPrice, totalCost, profit, components } = req.body;

    if (!name || !sellingPrice) {
      return res.status(400).json({ error: "اسم المنتج وسعر البيع مطلوبان" });
    }

    let imageUrl = "";

    if (req.file) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "pet_store_products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        bufferStream.pipe(uploadStream);
      });

      imageUrl = uploadResult.secure_url;
    }

    const newProduct = new Product({
      name,
      sellingPrice: Number(sellingPrice),
      totalCost: Number(totalCost) || 0,
      profit: Number(profit) || 0,
      components: components ? JSON.parse(components) : [],
      imageUrl,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==== جلب المنتجات ====
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==== تعديل منتج ====
router.put("/:id", upload.single("imageUrl"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sellingPrice, totalCost, profit, components } = req.body;

    const updateData = {
      name,
      sellingPrice: Number(sellingPrice),
      totalCost: Number(totalCost) || 0,
      profit: Number(profit) || 0,
      components: components ? JSON.parse(components) : [],
    };

    if (req.file) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "pet_store_products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        bufferStream.pipe(uploadStream);
      });

      updateData.imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ error: "المنتج غير موجود" });

    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
