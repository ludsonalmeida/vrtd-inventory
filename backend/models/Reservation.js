// ================================
// backend/models/Reservation.js
// ================================
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  people: { type: mongoose.Schema.Types.Mixed, required: true }, // number or '10+'
  area: { type: String, enum: ['Coberta', 'Descoberta', 'Porks Deck'], default: 'Coberta' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);