// backend/models/Supplier.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cnpj: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    // Se houver outros campos no futuro, basta adicioná-los aqui
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
