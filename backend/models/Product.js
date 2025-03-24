const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // author: {
  //   type: String,
  //   required: true,
  // },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["genel", "spor", "teknoloji", "eğitim", "kültür-sanat", "bilim"],
  },
  imageUrl: {
    type: String,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
