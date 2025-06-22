// =======================================
// backend/controllers/reservationController.js
// =======================================
require('dotenv').config();
const Reservation = require('../models/Reservation');
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// GET /api/reservations
// Lista reservas com paginação: usa ?page=1&limit=10
async function getAllReservations(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip  = (page - 1) * limit;
    const total = await Reservation.countDocuments();
    const list = await Reservation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return res.json({
      data: list,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Erro ao buscar reservas:', err);
    return res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
}

// GET /api/reservations/:id
async function getReservationById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Reservation.findById(id).exec();
    if (!item) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Erro ao buscar reserva:', err);
    return res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
}

// POST /api/reservations
async function createReservation(req, res, next) {
  try {
    const { date, time, name, phone, people, area } = req.body;

    // Campos obrigatórios
    if (!date || !time || !name || !phone || !people || !area) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Parse data (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    // Valida horário HH:mm
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Horário inválido (HH:mm)' });
    }

    // Valida telefone (DD) NNNNN-NNNN
    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)) {
      return res.status(400).json({ error: 'Telefone inválido. Use (DD) NNNNN-NNNN' });
    }

    // Valida área
    const validAreas = ['Coberta', 'Descoberta', 'Porks Deck'];
    if (!validAreas.includes(area)) {
      return res.status(400).json({ error: 'Área de preferência inválida' });
    }

    // Número de pessoas
    let peopleCount;
    if (people === '10+') {
      peopleCount = 11;
    } else {
      peopleCount = Number(people);
      if (isNaN(peopleCount) || peopleCount < 1) {
        return res.status(400).json({ error: 'Número de pessoas inválido' });
      }
    }

    // Cria e salva a reserva
    const newReservation = new Reservation({
      date: parsedDate,
      time,
      name: name.trim(),
      phone,
      people: peopleCount,
      area,
    });
    const saved = await newReservation.save();

    // Envia notificação via Twilio (WhatsApp)
    try {
      const messageBody =
        `📅 *Nova Reserva*\n` +
        `Nome: ${saved.name}\n` +
        `Data: ${saved.date.toLocaleDateString()}\n` +
        `Hora: ${saved.time}\n` +
        `Telefone: ${saved.phone}\n` +
        `Pessoas: ${saved.people}\n` +
        `Área: ${saved.area}`;
      const toNumber = process.env.COMPANY_WHATSAPP_TO.startsWith('whatsapp:')
        ? process.env.COMPANY_WHATSAPP_TO
        : `whatsapp:${process.env.COMPANY_WHATSAPP_TO}`;
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: toNumber,
        body: messageBody,
      });
      console.log('WhatsApp enviado com sucesso');
    } catch (twErr) {
      console.error('Erro ao enviar notificação via Twilio:', twErr);
    }

    return res.status(201).json(saved);
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    return res.status(500).json({ error: 'Erro interno ao criar reserva' });
  }
}

// PUT /api/reservations/:id
async function updateReservation(req, res, next) {
  try {
    const { id } = req.params;
    const { date, time, name, phone, people, area } = req.body;
    const updateData = {};
    if (date) {
      const [y, m, d] = date.split('-').map(Number);
      updateData.date = new Date(y, m - 1, d);
    }
    if (time) updateData.time = time;
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone;
    if (people) updateData.people = people === '10+' ? 11 : Number(people);
    if (area) updateData.area = area;

    const updated = await Reservation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar reserva:', err);
    return res.status(400).json({ error: 'Erro ao atualizar reserva' });
  }
}

// DELETE /api/reservations/:id
async function deleteReservation(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await Reservation.findByIdAndDelete(id).exec();
    if (!removed) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    return res.json({ message: 'Reserva excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir reserva:', err);
    return res.status(500).json({ error: 'Erro ao excluir reserva' });
  }
}

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
