const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  avgPrice: { type: Number, default: 0 },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
