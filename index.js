import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import toolRoutes from "./routes/toolRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import lossesRoutes from "./routes/lossRoutes.js";



dotenv.config();
const app = express();

// ======== Config ========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======== Setup paths ========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======== Static files ========
app.use(express.static(path.join(__dirname, "public")));

// ======== Routes ========
app.use("/api/products", productRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/losses", lossesRoutes);

// ======== Serve HTML (Admin Page) ========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ======== Connect MongoDB ========
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 OraDesign Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
