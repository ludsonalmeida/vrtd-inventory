const nodemailer = require('nodemailer');

function makeTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = String(process.env.EMAIL_SECURE || 'false') === 'true';

  if (!host) {
    console.warn('[EMAIL] EMAIL_HOST não definido — notificação desabilitada');
    return null;
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

const transporter = makeTransport();

async function sendMail({ to, subject, text, html }) {
  if (!transporter) return false;

  const from = process.env.EMAIL_FROM || 'no-reply@example.com';
  const recipients = to || process.env.EMAIL_TO;
  if (!recipients) {
    console.warn('[EMAIL] Sem destinatários (EMAIL_TO ausente).');
    return false;
  }

  try {
    const info = await transporter.sendMail({ from, to: recipients, subject, text, html });
    console.log('[EMAIL] Enviado:', info.messageId);
    return true;
  } catch (err) {
    console.error('[EMAIL] Falha ao enviar:', err);
    return false;
  }
}

module.exports = { sendMail };
