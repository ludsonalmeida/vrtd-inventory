// utils/email.js (ou no controller se você não usa helper separado)
const nodemailer = require('nodemailer');

function buildTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure = String(process.env.EMAIL_SECURE || 'true') === 'true';

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] USER/PASS ausentes — e-mails desabilitados');
    return null;
  }
  // Se não setar host/porta, use o preset do Gmail
  return host
    ? nodemailer.createTransport({ host, port, secure, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } })
    : nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
}

const mailer = buildTransport();

async function sendReservationEmail(res) {
  if (!mailer) return false;

  const to = process.env.EMAIL_TO || 'ludson.bsa@gmail.com,porks.sobradinho@gmail.com';
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER; // <- forçar Gmail como remetente
  const whenDate = res.date ? new Date(res.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '-';

  const subject = `🟣 Nova reserva — ${res.name} (${res.people} pessoas)`;
  const text = `Nova reserva:
Nome: ${res.name}
Telefone: ${res.phone || '-'}
Quando: ${whenDate} às ${res.time || '-'}
Pessoas: ${res.people || '-'}
Área: ${res.area || '-'}
Criada em: ${new Date(res.createdAt || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
ID: ${res._id}`;

  try {
    const info = await mailer.sendMail({ from, to, subject, text });
    console.log('[EMAIL] Reserva enviada:', info.messageId, '→', to);
    return true;
  } catch (e) {
    console.error('[EMAIL] Falha ao enviar reserva:', e);
    return false;
  }
}

module.exports = { sendReservationEmail };
