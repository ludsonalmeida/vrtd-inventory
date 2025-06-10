// backend/routes/scanInvoice.js
const express   = require('express');
const multer    = require('multer');
const Tesseract = require('tesseract.js');
const pdfParse  = require('pdf-parse');
const fs        = require('fs');
const { OpenAI }= require('openai');
require('dotenv').config();

const upload = multer({ dest: '/tmp' });
const router = express.Router();
const ai     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/products/scan-invoice
router.post('/', upload.single('invoice'), async (req, res) => {
  try {
    // 1) Verifica se veio arquivo
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // 2) Extrai texto
    let rawText = '';
    const { mimetype, path: tempPath } = req.file;
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(tempPath);
      rawText = (await pdfParse(dataBuffer)).text;
    } else {
      rawText = (await Tesseract.recognize(tempPath, 'por')).data.text;
    }

    // 3) Monta prompt para ChatGPT
    const prompt = `
Texto extraído da nota fiscal:
${rawText}

Texto extraído da nota fiscal:
${rawText}


Você é um parser de notas fiscais e comandas. Receberá como entrada o texto bruto extraído por OCR de um documento de venda ou nota fiscal, de formato livre, e deve retornar apenas um JSON com uma lista de objetos, cada um contendo:

name: a descrição completa do produto.

unitPrice: o preço unitário, em formato numérico (ponto decimal).

Não inclua nenhum outro campo, nem texto explicativo. Se algum preço vier com vírgula, converta para ponto decimal. Se aparecer “R$” remova-o antes de converter. Ignore totais, descontos, quantidades ou outras colunas.

Regras:
- name: nome completo, sem abreviações (ex.: "CR CHEESE" → "Cream Cheese").
- quantity: inteiro.
- unitPrice e totalPrice: números (use ponto como decimal).
- description: breve descrição do tipo de produto.


Texto da nota/comanda:
----------------------------------------
Pedido: 4095   NF:   Emissão: 05/06/2025 14:34  
Produto                              Qtde    Preço Unit.  Valor Cobrado  
BARRIL - VINHO 30 LITROS             2,000   R$ 390,00     R$ 780,00  
BARRIL BIOMMA CAATINGA - PILSEN ...  4,000   R$ 400,00     R$ 1.600,00  
... (restante do texto)

ou

7898629640127  CR CULINÁRIO SULMINAS 1,2kg   1,000 un   42,99  42,99  
7898629630123  REQUEIJÃO CANTO DE MINAS      1,000 un   23,99  23,99  
... (restante do texto)
----------------------------------------

[
  { "name": "BARRIL - VINHO 30 LITROS", "unitPrice": 390.00, "description": Barril de Chope de Vinho de 30L },
  { "name": "BARRIL BIOMMA CAATINGA - PILSEN PURO MALTE 50 LITROS", "unitPrice": 400.00 },
  { "name": "CR CULINÁRIO SULMINAS 1,2kg", "unitPrice": 42.99 },
  { "name": "REQUEIJÃO CANTO DE MINAS 1,2kg", "unitPrice": 23.99 }
]

Retorne apenas o JSON acima, sem texto adicional.

`;

    // 4) Chama a API do OpenAI
    const response = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você converge texto de nota fiscal em JSON.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0
    });

    // 5) Limpa marcações de bloco ```json
    let jsonText = response.choices[0].message.content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }

    // 6) Parseia JSON
    let products;
    try {
      products = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('JSON inválido da IA:', jsonText);
      return res.status(500).json({ error: 'Formato de JSON inválido', detail: parseErr.message });
    }

    // 7) Retorna lista
    return res.json({ products });
  } catch (err) {
    console.error('Erro no scan-invoice:', err);
    return res.status(500).json({ error: 'Erro ao processar invoice: ' + err.message });
  }
});

module.exports = router;
