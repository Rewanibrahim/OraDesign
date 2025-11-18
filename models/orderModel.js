const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  components: [componentSchema],
  totalCost: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  products: [productSchema],
  paperType: {
  type: String,
  enum: ["كوشيه", "ستيكر", "none"], // لو مفيش طباعة
  default: "none",
},
paperCount: { type: Number, default: 0 },
paperPrice: { type: Number, default: 0 },
paperTotal: { type: Number, default: 0 }, // (count * price)

  totalCost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  deliveryDate: { type: Date, required: false, default: null },
  status: { type: String, default: "قيد التنفيذ" }
}, { timestamps: true });

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastOrder = await this.constructor.findOne().sort({ orderNumber: -1 });
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
