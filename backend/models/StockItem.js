const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockItemSchema = new Schema(
  {
    // Referência ao produto já cadastrado
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Categoria associada ao estoque (pode vir do produto ou ser escolhida)
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
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
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: false,
    },
    status: {
      type: String,
      enum: ['Cheio', 'Meio', 'Final', 'Baixo', 'Vazio', 'N/A'],
      default: 'N/A',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockItem', stockItemSchema);
