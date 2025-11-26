import mongoose from "mongoose";

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 }
}, { timestamps: true });

export default mongoose.model("Tool", toolSchema);

