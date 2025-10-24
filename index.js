const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

dotenv.config();
const app = express();

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors({ origin: "*", methods: ["GET","POST","PATCH","PUT","DELETE"], allowedHeaders:["Content-Type"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Routes
const orderRoutes = require("./routes/orderRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const toolRoutes = require("./routes/toolRoutes.js");

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tools", toolRoutes);

// Route رئيسية تفتح صفحة admin.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// توصيل DB وتشغيل السيرفر
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ MongoDB connection failed:', err.message));

module.exports = { cloudinary };
