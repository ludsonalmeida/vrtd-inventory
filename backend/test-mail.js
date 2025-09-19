// test-mail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  const t = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || 'true') === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await t.verify(); // checa login/SSL
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_TO || 'ludson.bsa@gmail.com,porks.sobradinho@gmail.com',
    subject: 'Teste SMTP — Porks Reservas',
    text: 'Deu certo! SMTP funcionando. ✔️',
  });
  console.log('OK:', info.messageId);
})();
