// =======================================
// backend/controllers/reservationController.js
// =======================================
require('dotenv').config();
const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

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
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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

function fireAndForget(fn) {
  setImmediate(async () => {
    try { await fn(); } catch (e) { console.error('[reservation bg job]', e); }
  });
}

function toBRDateString(d) {
  try {
    return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  } catch {
    return '-';
  }
}

// ---------- Controllers ----------

// GET /api/reservations
// Suporta: ?page=1&limit=10  OU  ?pagination[page]=1&pagination[pageSize]=200
async function getAllReservations(req, res) {
  try {
    // compat com estilo Strapi v4
    const hasStrapiStyle =
      req.query['pagination[page]'] || req.query['pagination[pageSize]'];

    const page = Math.max(
      1,
      parseInt(hasStrapiStyle ? req.query['pagination[page]'] : req.query.page, 10) || 1
    );
    const limit = Math.max(
      1,
      parseInt(hasStrapiStyle ? req.query['pagination[page]]'] : req.query.limit, 10) || 10
    );

    const skip = (page - 1) * limit;
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
        pages: Math.ceil(total / limit),
        pagination: { page, pageSize: limit, pageCount: Math.ceil(total / limit) },
      },
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
// ► Permite reserva para HOJE mesmo com menos de 2h.
//   Se < 120min, devolve `needsFastConfirm: true` + `waLink` (wa.me) para o cliente abrir o WhatsApp.
// POST /api/reservations
// ► Permite HOJE mesmo com <2h; responde waLink com mensagem pronta.
async function createReservation(req, res) {
  const t0 = Date.now();
  try {
    console.log('[RES] createReservation HIT', req.body);

    const { date, time, name, phone, people, area } = req.body;

    // --------- validações de presença ---------
    if (!date || !time || !name || !phone || !people || !area) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // --------- data (YYYY-MM-DD) ---------
    const [year, month, day] = String(date).split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    // --------- hora (HH:mm) ---------
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Horário inválido (HH:mm)' });
    }

    // --------- telefone (10 ou 11 dígitos) ---------
    const phoneDigits = String(phone).replace(/\D/g, '');
    if (!(phoneDigits.length === 10 || phoneDigits.length === 11)) {
      return res.status(400).json({ error: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos)' });
    }
    const phoneFormatted = phoneDigits.length === 11
      ? `(${phoneDigits.slice(0,2)}) ${phoneDigits.slice(2,7)}-${phoneDigits.slice(7)}`
      : `(${phoneDigits.slice(0,2)}) ${phoneDigits.slice(2,6)}-${phoneDigits.slice(6)}`;

    // --------- pessoas ---------
    const peopleNum = people === '10+' ? 11 : Number(people);
    if (!Number.isFinite(peopleNum) || peopleNum < 1) {
      return res.status(400).json({ error: 'Número de pessoas inválido' });
    }

    // --------- área: NORMALIZAÇÃO CANÔNICA ---------
    const CANON = ['Coberta', 'Descoberta', 'Porks Deck'];
    const ALIASES = {
      'deck': 'Porks Deck', 'porks deck': 'Porks Deck',
      'externa': 'Descoberta', 'exterior': 'Descoberta', 'ao ar livre': 'Descoberta', 'fora': 'Descoberta',
      'coberta': 'Coberta', 'descoberta': 'Descoberta'
    };
    const rawArea = String(area).trim();
    const areaNorm = CANON.includes(rawArea)
      ? rawArea
      : (ALIASES[rawArea.toLowerCase()] || rawArea);
    if (!CANON.includes(areaNorm)) {
      return res.status(400).json({ error: 'Área de preferência inválida' });
    }

    // --------- regra HOJE (<2h) -> apenas flag para confirmar rápido ---------
    const [hh, mm] = time.split(':').map(Number);
    const reservationDateTime = new Date(year, month - 1, day, hh, mm, 0, 0);
    const now = new Date();
    const isSameDay = reservationDateTime.toDateString() === now.toDateString();
    const diffMin = Math.round((reservationDateTime.getTime() - now.getTime()) / 60000);
    const needsFastConfirm = isSameDay && diffMin < 120;
    if (isSameDay && diffMin < 0) {
      return res.status(400).json({ error: 'Esse horário já passou para hoje. Escolha outro horário.' });
    }

    // --------- cria doc ---------
    const newReservation = new Reservation({
      date: parsedDate,
      time,
      name: String(name).trim(),
      phone: phoneFormatted,
      people: peopleNum,
      area: areaNorm,         // ✅ sempre canônico
      status: 'pending',
      createdAt: new Date(),
    });

    const saved = await newReservation.save();
    console.log('[RES] saved', saved._id);

    // --------- monta waLink com mensagem pronta ---------
    const toBR = (d) => d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const whenDateBR = toBR(parsedDate);
    const msg =
      `Ola, acabei de fazer minha pre reserva no site para "${whenDateBR}" ` +
      `${time} e ${peopleNum} Pessoas em nome de ${String(name).trim()}, pode confirmar?`;
    const waTo = '5561935003917';
    const waLink = `https://wa.me/${waTo}?text=${encodeURIComponent(msg)}`;

    // --------- responde 202 + waLink ---------
    res.status(202).json({
      ok: true,
      id: saved._id,
      message: needsFastConfirm
        ? 'Pré-reserva registrada! Para hoje com menos de 2h, confirme rapidamente no WhatsApp.'
        : 'Pré-reserva registrada. Nosso concierge vai confirmar em breve.',
      needsFastConfirm,
      waLink,
    });
    console.log(`[RES] POST -> 202 in ${Date.now() - t0}ms id=${saved._id}`);

    // --------- e-mail em background (não bloqueia a resposta) ---------
    setImmediate(async () => {
      try {
        await sendReservationEmail(saved);
      } catch (e) {
        console.error('[EMAIL] falhou (ignorado para o cliente):', e);
      }
    });

  } catch (err) {
    console.error('Erro ao criar reserva:', err);

    // Mongoose validation
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message).join('; ');
      return res.status(400).json({ error: `Validação: ${details}` });
    }
    // Mongo offline / seleção de servidor
    if (err?.name === 'MongoServerSelectionError' || err?.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Banco de dados indisponível. Tente novamente.' });
    }
    // Duplicidade (se houver índice único)
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Conflito: registro duplicado.' });
    }

    // Fallback
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
      const digits = String(phone).replace(/\D/g, '');
      if (!(digits.length === 10 || digits.length === 11)) {
        return res.status(400).json({ error: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos)' });
      }
      updateData.phone = digits.length === 11
        ? `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
        : `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    }

    if (people) {
      const p = people === '10+' ? 11 : Number(people);
      if (!Number.isFinite(p) || p < 1) {
        return res.status(400).json({ error: 'Número de pessoas inválido' });
      }
      updateData.people = p;
    }

    if (area) {
      const validAreas = ['Coberta', 'Descoberta', 'Porks Deck', 'Deck', 'Externa', 'Área Externa'];
      const mapAliases = {
        'deck': 'Porks Deck',
        'externa': 'Descoberta',
        'exterior': 'Descoberta',
        'ao ar livre': 'Descoberta',
      };
      const lower = String(area).trim().toLowerCase();
      const areaNorm = validAreas.includes(area) ? area : (mapAliases[lower] || area);
      if (!validAreas.includes(areaNorm)) {
        return res.status(400).json({ error: 'Área de preferência inválida' });
      }
      updateData.area = areaNorm;
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
