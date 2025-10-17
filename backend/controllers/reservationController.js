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
    const info = await mailer.sendMail({ from, to: recipients, subject, text, html });
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

// dispara tarefa sem bloquear a resposta
function fireAndForget(fn) {
  setImmediate(async () => {
    try { await fn(); } catch (e) { console.error('[reservation bg job]', e); }
  });
}

// ---------- Controllers ----------

// GET /api/reservations
// Lista reservas com paginação: usa ?page=1&limit=10
async function getAllReservations(req, res) {
  try {
    const wantAll =
      String(req.query.all || '').toLowerCase() === '1' ||
      String(req.query.all || '').toLowerCase() === 'true';

    const total = await Reservation.countDocuments();

    if (wantAll) {
      // Sem paginação: traz tudo
      const list = await Reservation.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return res.json({
        data: list,
        meta: { total, page: 1, limit: total, pages: 1, all: true },
      });
    }

    // Paginação (com limite máximo de segurança)
    const MAX_LIMIT = Number(process.env.MAX_PAGE_LIMIT || 1000);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const rawLimit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const limit = Math.min(rawLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const list = await Reservation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return res.json({
      data: list,
      meta: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
        all: false,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar reservas:', err);
    return res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
}

// POST /api/reservations
// -> grava rápido e responde 202; notificações seguem em background
// POST /api/reservations
// -> grava rápido e responde 202; notificações seguem em background
async function createReservation(req, res) {
  const t0 = Date.now();
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

    // ─────────────────────────────────────────────────────────────
    // NOVA REGRA: antecedência mínima de 2h para reservas HOJE
    // (server já está com TZ=America/Sao_Paulo no index.js)
    const [hh, mm] = time.split(':').map(Number);
    const reservationDateTime = new Date(year, month - 1, day, hh, mm, 0, 0);
    const now = new Date();
    const isSameDay = reservationDateTime.toDateString() === now.toDateString();
    const diffMin = Math.round((reservationDateTime.getTime() - now.getTime()) / 60000);

    if (isSameDay) {
      if (diffMin < 0) {
        return res.status(400).json({
          error: 'Esse horário já passou para hoje. Escolha outro horário.'
        });
      }
      if (diffMin < 120) {
        // mensagem alinhada ao que você pediu + atalho do WhatsApp
        return res.status(400).json({
          error:
            'Para reservas para hoje, precisamos de 2h de antecedência para confirmar. ' +
            'Por favor, escolha um horário mais tarde ou confirme direto no WhatsApp: ' +
            'https://wa.me/5561999999999?text=Quero%20confirmar%20minha%20pr%C3%A9-reserva%2C%20tive%20erro%20no%20site.'
        });
      }
    }
    // ─────────────────────────────────────────────────────────────

    const newReservation = new Reservation({
      date: parsedDate,
      time,
      name: String(name).trim(),
      phone,
      people: peopleCount,
      area,
      status: 'pending',
      createdAt: new Date(),
    });

    const saved = await newReservation.save();
    console.log('[RES] saved', saved._id);

    // RESPONDE JÁ — não espera e-mail/whatsapp
    res.status(202).json({
      ok: true,
      id: saved._id,
      message: 'Pré-reserva registrada. O concierge vai entrar em contato para confirmar.',
    });
    console.log(`[RES] POST -> 202 in ${Date.now() - t0}ms id=${saved._id}`);

    // Notificações em background (mantidas)
    fireAndForget(async () => {
      await sendReservationEmail(saved);
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

        try {
          const resp = await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: toNumber,
            body: messageBody,
          });
          console.log('WhatsApp enviado:', resp.sid);
        } catch (twErr) {
          console.error('Erro ao enviar WhatsApp via Twilio:', twErr);
        }
      } else {
        console.warn('[TWILIO] Desabilitado (cliente nulo ou FROM/TO ausentes)');
      }

      try {
        await Reservation.findByIdAndUpdate(saved._id, {
          $set: { status: 'notified', notifiedAt: new Date() },
        });
      } catch (e) {
        console.error('[RES] status update erro:', e);
      }
    });

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
