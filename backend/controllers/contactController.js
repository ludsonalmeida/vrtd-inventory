// backend/controllers/contactController.js
require('dotenv').config();
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /api/contact
// Envia mensagem de contato via WhatsApp
async function sendMessage(req, res) {
  try {
    const { name, email, message } = req.body;

    // Validações básicas
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Formata mensagem
    const messageBody = `📩 *Novo Contato*
` +
      `Nome: ${name}
` +
      `Email: ${email}
` +
      `Mensagem: ${message}`;

    // Envia mensagem via Twilio
    const toNumber = process.env.COMPANY_WHATSAPP_TO.startsWith('whatsapp:')
      ? process.env.COMPANY_WHATSAPP_TO
      : `whatsapp:${process.env.COMPANY_WHATSAPP_TO}`;

    const sentMessage = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toNumber,
      body: messageBody,
    });

    console.log('Mensagem enviada com sucesso, SID:', sentMessage.sid);
    return res.status(200).json({ message: 'Mensagem enviada com sucesso' });
  } catch (err) {
    console.error('Erro ao enviar mensagem de contato:', err);
    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
}

module.exports = { sendMessage };
