// testeWP.mjs
import twilio from 'twilio';

const accountSid = 'ACde2be4891eee175c592c09447abf23ba';
const authToken  = 'd6104c9b94e47c7e16884b1086465af0';
const client     = twilio(accountSid, authToken);

;(async () => {
  try {
    const message = await client.messages.create({
      body: '🚀 Teste de WhatsApp pelo Sandbox!',
      from: 'whatsapp:+14155238886',
      to:   'whatsapp:+556181776251'
    });
    console.log('Mensagem enviada, SID:', message.sid);
  } catch (err) {
    console.error('Falha ao enviar WhatsApp:', err);
  }
})();
