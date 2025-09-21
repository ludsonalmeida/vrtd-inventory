// =======================================
// backend/controllers/reservationController.js
// =======================================
require('dotenv').config();
const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// ---------- Helpers: Email ----------
function buildTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = String(process.env.EMAIL_SECURE || 'false') === 'true';

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] EMAIL_USER/EMAIL_PASS ausentes — e-mails desabilitados');
    return null;
  }

  if (!host) {
    console.warn('[EMAIL] EMAIL_HOST ausente — usando preset "gmail"');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const mailer = buildTransport();
const DEFAULT_RECIPIENTS = 'ludson.bsa@gmail.com,porks.sobradinho@gmail.com';

async function sendReservationEmail(reservationDoc) {
  if (!mailer) return false;

  const recipients =
    (process.env.EMAIL_TO && String(process.env.EMAIL_TO)) || DEFAULT_RECIPIENTS;

  // Gmail: remetente deve ser o usuário autenticado (ou alias verificado)
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const whenDate =
    reservationDoc.date instanceof Date
      ? reservationDoc.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : '-';
  const whenTime = reservationDoc.time || '-';

  const subject = `🟣 Nova reserva — ${reservationDoc.name} (${reservationDoc.people} pessoas)`;
  const text = [
    'Nova reserva recebida:',
    `Nome: ${reservationDoc.name}`,
    `Telefone: ${reservationDoc.phone || '-'}`,
    `Quando: ${whenDate} às ${whenTime}`,
    `Pessoas: ${reservationDoc.people || '-'}`,
    `Área: ${reservationDoc.area || '-'}`,
    `Criada em: ${new Date(reservationDoc.createdAt || Date.now()).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })}`,
    `ID: ${reservationDoc._id}`,
  ].join('\n');

  const html = `
    <h2>Nova reserva recebida</h2>
    <ul>
      <li><b>Nome:</b> ${reservationDoc.name}</li>
      <li><b>Telefone:</b> ${reservationDoc.phone || '-'}</li>
      <li><b>Quando:</b> ${whenDate} às ${whenTime}</li>
      <li><b>Pessoas:</b> ${reservationDoc.people || '-'}</li>
      <li><b>Área:</b> ${reservationDoc.area || '-'}</li>
      <li><b>Criada em:</b> ${new Date(reservationDoc.createdAt || Date.now()).toLocaleString(
        'pt-BR',
        { timeZone: 'America/Sao_Paulo' }
      )}</li>
      <li><b>ID:</b> ${reservationDoc._id}</li>
    </ul>
  `;

  try {
    const info = await mailer.sendMail({
      from,
      to: recipients,
      subject,
      text,
      html,
    });
    console.log('[EMAIL] Enviado:', info.messageId, 'para:', recipients);
    return true;
  } catch (err) {
    console.error('[EMAIL] Falha ao enviar:', err);
    return false;
  }
}

// ---------- Helpers: Utils ----------
function tzDateBR(date) {
  return new Date(date || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// ---------- Controllers ----------

// GET /api/reservations
// Lista reservas com paginação: usa ?page=1&limit=10
async function getAllReservations(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const total = await Reservation.countDocuments();
    const list = await Reservation.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    return res.json({
      data: list,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Erro ao buscar reservas:', err);
    return res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
}

// GET /api/reservations/:id
async function getReservationById(req, res) {
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
async function createReservation(req, res) {
  try {
    console.log('[RES] createReservation HIT', req.body);

    const { date, time, name, phone, people, area } = req.body;

    if (!date || !time || !name || !phone || !people || !area) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [year, month, day] = String(date).split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Horário inválido (HH:mm)' });
    }

    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)) {
      return res.status(400).json({ error: 'Telefone inválido. Use (DD) NNNNN-NNNN' });
    }

    const validAreas = ['Coberta', 'Descoberta', 'Porks Deck'];
    if (!validAreas.includes(area)) {
      return res.status(400).json({ error: 'Área de preferência inválida' });
    }

    let peopleCount;
    if (people === '10+') {
      peopleCount = 11;
    } else {
      peopleCount = Number(people);
      if (isNaN(peopleCount) || peopleCount < 1) {
        return res.status(400).json({ error: 'Número de pessoas inválido' });
      }
    }

    const newReservation = new Reservation({
      date: parsedDate,
      time,
      name: String(name).trim(),
      phone,
      people: peopleCount,
      area,
    });

    const saved = await newReservation.save();
    console.log('[RES] saved', saved._id);

    // ---------- Notificações ----------
    // Para depuração em produção: defina EMAIL_SYNC=true nas variáveis e o envio fica síncrono (mostra erro no log)
    const shouldAwait = String(process.env.EMAIL_SYNC || 'false') === 'true';

    if (shouldAwait) {
      const okEmail = await sendReservationEmail(saved);
      console.log('[RES] email ok?', okEmail);
    } else {
      sendReservationEmail(saved)
        .then((ok) => console.log('[RES] email ok?', ok))
        .catch((err) => console.error('[RES] email erro:', err));
    }

    if (twilioClient && process.env.TWILIO_WHATSAPP_FROM && process.env.COMPANY_WHATSAPP_TO) {
      const toNumber = String(process.env.COMPANY_WHATSAPP_TO).startsWith('whatsapp:')
        ? process.env.COMPANY_WHATSAPP_TO
        : `whatsapp:${process.env.COMPANY_WHATSAPP_TO}`;

      const messageBody =
        `📅 *Nova Reserva*\n` +
        `Nome: ${saved.name}\n` +
        `Data: ${saved.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n` +
        `Hora: ${saved.time}\n` +
        `Telefone: ${saved.phone}\n` +
        `Pessoas: ${saved.people}\n` +
        `Área: ${saved.area}\n` +
        `Criada em: ${tzDateBR(saved.createdAt)}`;

      const sendWhatsApp = async () => {
        try {
          const resp = await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: toNumber,
            body: messageBody,
          });
          console.log('WhatsApp enviado com sucesso:', resp.sid);
          return true;
        } catch (twErr) {
          console.error('Erro ao enviar notificação via Twilio:', twErr);
          return false;
        }
      };

      if (shouldAwait) {
        const okWa = await sendWhatsApp();
        console.log('[RES] whatsapp ok?', okWa);
      } else {
        sendWhatsApp()
          .then((okWa) => console.log('[RES] whatsapp ok?', okWa))
          .catch((errWa) => console.error('[RES] whatsapp erro:', errWa));
      }
    } else {
      console.warn('[TWILIO] Desabilitado (cliente nulo ou FROM/TO ausentes)');
    }

    return res.status(201).json(saved);
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    return res.status(500).json({ error: 'Erro interno ao criar reserva' });
  }
}

// PUT /api/reservations/:id
async function updateReservation(req, res) {
  try {
    const { id } = req.params;
    const { date, time, name, phone, people, area } = req.body;
    const updateData = {};

    if (date) {
      const [y, m, d] = String(date).split('-').map(Number);
      updateData.date = new Date(y, m - 1, d);
      if (isNaN(updateData.date)) {
        return res.status(400).json({ error: 'Data inválida' });
      }
    }
    if (time) {
      if (!/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: 'Horário inválido (HH:mm)' });
      }
      updateData.time = time;
    }
    if (name) updateData.name = String(name).trim();
    if (phone) {
      if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)) {
        return res.status(400).json({ error: 'Telefone inválido. Use (DD) NNNNN-NNNN' });
      }
      updateData.phone = phone;
    }
    if (people) updateData.people = people === '10+' ? 11 : Number(people);
    if (area) {
      const validAreas = ['Coberta', 'Descoberta', 'Porks Deck'];
      if (!validAreas.includes(area)) {
        return res.status(400).json({ error: 'Área de preferência inválida' });
      }
      updateData.area = area;
    }

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
async function deleteReservation(req, res) {
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
  deleteReservation,
};
