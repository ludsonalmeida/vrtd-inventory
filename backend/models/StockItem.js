const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  stockMin: {
    type: Number,
    default: 0,
  },
  stockMax: {
    type: Number,
    default: 0,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
  },
  status: {
    type: String,
    enum: ['Cheio', 'Meio', 'Baixo', 'Final', 'Vazio', 'N/A'],
    default: 'N/A',
  },
}, { timestamps: true });

module.exports = mongoose.model('StockItem', stockItemSchema);