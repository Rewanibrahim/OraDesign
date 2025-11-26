import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sellingPrice: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  components: [componentSchema],
  imageUrl: { type: String, default: "" },
  category: { type: String, default: "" },
  subcategory: { type: String, default: "" },
  brand: { type: String, default: "" },
  description: { type: String, default: "" }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
