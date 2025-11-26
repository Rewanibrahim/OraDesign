import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  products: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true, default: 1 },
      sellingPrice: { type: Number, required: true, default: 0 },
      totalCost: { type: Number, required: true, default: 0 }
    }
  ],
  paperDetails: [
    {
      paperType: { type: String, enum: ["كوشيه", "ستيكر"], required: true },
      numberOfPapers: { type: Number, default: 0 },
      paperCost: { type: Number, default: 0 },
      totalPaperCost: { type: Number, default: 0 }
    }
  ],
  totalCost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  deliveryDate: { type: Date },
  status: { type: String, default: "قيد التنفيذ" }
}, { timestamps: true });

const OrderTest = mongoose.model("OrderTest", orderSchema);
export default OrderTest;
