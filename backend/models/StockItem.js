// backend/models/StockItem.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockItemSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Cheio', 'Meio', 'Final', 'Baixo', 'N/A'],
      default: 'N/A'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockItem', stockItemSchema);
