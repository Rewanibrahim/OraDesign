// models/Loss.js
import mongoose from "mongoose";

const lossSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // اسم الخسارة أو السبب
  },
  amount: {
    type: Number,
    required: true, // قيمة الخسارة
  },
});

export default mongoose.model("Loss", lossSchema);
