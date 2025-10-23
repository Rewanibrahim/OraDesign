const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
});

module.exports = mongoose.model("Tool", toolSchema);
