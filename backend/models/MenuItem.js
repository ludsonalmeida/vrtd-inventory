// backend/models/MenuItem.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * MenuItem representa um item exibido no cardápio público.
 * Mantemos "section" para mapear 1:1 com as seções da UI atual:
 *  - "items"  -> Sugestões do dia
 *  - "promos" -> Promoções do dia
 *  - "chopes" -> Lista de chopes
 */
const suggestionSchema = new Schema({
  label:      { type: String, required: true, trim: true },
  priceDelta: { type: Number, default: 0 }, // opcional: acréscimo no preço
  type:       { type: String, enum: ['side','sauce','extra','drink'], default: 'side' },
  isDefault:  { type: Boolean, default: false },
  // Se quiser atrelar ao estoque para CMV, deixe opcional:
  stockItem:  { type: Schema.Types.ObjectId, ref: 'StockItem' },
}, { _id: false });

const menuItemSchema = new Schema({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
  unitNameCache: { type: String, trim: true }, // grava o nome na criação p/ facilitar filtros públicos

  slug: { type: String, trim: true }, // ex: "chope-ipa-300" (útil para URLs)
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true, default: '' },
  subtitle2: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },

  image: { type: String, trim: true, default: '' }, // URL

  // Preços
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },

  // Exibição
  section: { type: String, required: true, enum: ['items','promos','chopes'], index: true },
  tags: [{ type: String, trim: true }],
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // Campos específicos para chopes
  abv: { type: Number, min: 0 },  // teor alcoólico
  ibu: { type: Number, min: 0 },  // amargor
  volumeMl: { type: Number, min: 0 },

  // Sugestões de acompanhamento (internas ao item)
  suggestions: [suggestionSchema],

  // Auditoria
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Índice para busca full-text simples
menuItemSchema.index({
  title: 'text',
  subtitle: 'text',
  subtitle2: 'text',
  tags: 'text',
  description: 'text',
});

// Unicidade opcional: por unidade + slug
menuItemSchema.index({ unit: 1, slug: 1 }, { unique: true, partialFilterExpression: { slug: { $exists: true, $ne: null } } });

module.exports = mongoose.model('MenuItem', menuItemSchema);
