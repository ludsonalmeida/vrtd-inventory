// src/routes/productScan.js
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';          // ou serviço cloud
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const upload = multer({ dest: '/tmp' });

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

router.post('/scan-invoice', upload.single('invoice'), async (req, res) => {
  try {
    // 1) OCR local (Tesseract)
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'por',                 // português
      { logger: m => console.log(m) }
    );

    // 2) Prompt para IA extrair produtos
    const prompt = `
Você é um assistente que recebe o texto bruto extraído de uma nota fiscal.  
Formate em JSON a lista de produtos, com chaves:
- name (string)
- quantity (número inteiro)
- unitPrice (número, R$)
- totalPrice (número, R$)
- description (opcional, string)

Exemplo de saída:
[
  { "name": "Arroz Tipo 1", "quantity": 2, "unitPrice": 25.50, "totalPrice": 51.00 },
  { "name": "Feijão Preto", "quantity": 1, "unitPrice": 15.75, "totalPrice": 15.75 }
]

Texto a processar:
\`\`\`
${text}
\`\`\`
`;

    // 3) Chamada à OpenAI
    const chatRes = await openai.createChatCompletion({
      model: 'gpt-4o-mini',  // ou gpt-4o se tiver acesso
      messages: [
        { role: 'system', content: 'Você formata nota fiscal em JSON de produtos.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0
    });

    // 4) Parse do JSON interno
    const jsonText = chatRes.data.choices[0].message.content;
    const products = JSON.parse(jsonText);

    // 5) Retorna ao front
    return res.json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro processando imagem ou IA.' });
  }
});

export default router;
