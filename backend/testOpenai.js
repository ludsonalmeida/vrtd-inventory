// backend/testOpenai.js

// 1) Carrega variáveis de ambiente
require('dotenv').config();

// 2) Importa o cliente OpenAI (v4)
const { OpenAI } = require('openai');

// 3) Inicializa com sua chave
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function runTest() {
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',       // ou 'gpt-4o-mini' se você tiver acesso
      messages: [
        { role: 'system', content: 'Você é um assistente de teste.' },
        { role: 'user',   content: 'Diga: API funcionando!' }
      ],
      temperature: 0
    });

    console.log('Resposta da API:', res.choices[0].message.content);
  } catch (err) {
    console.error('Erro ao chamar OpenAI:', err.message || err);
  }
}

runTest();
