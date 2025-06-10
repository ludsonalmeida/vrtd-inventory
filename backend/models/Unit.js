// backend/models/Unit.js

const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    iconName: {
      type: String,
      required: true,  // <- obrigatório
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Unit', unitSchema);
