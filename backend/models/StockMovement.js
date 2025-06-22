const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['entrada', 'saida'], required: true },
  date: { type: Date, default: Date.now },
  reason: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // quem fez a movimentação
});

module.exports = mongoose.model('StockMovement', StockMovementSchema);
