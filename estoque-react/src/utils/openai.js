import axios from 'axios';

export async function parseContagemWithOpenAI(contagemText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key missing');


  const prompt = `
Você é um assistente de estoque de um bar especializado em chope.

Sua tarefa é transformar a seguinte contagem de estoque, recebida via WhatsApp, em um array JSON.

### Regras de interpretação:

- Cada produto (ou status) deve ser uma entrada separada.
- Campos obrigatórios por item:
  - name: Nome completo do produto conforme informado.
  - quantity: Quantidade de unidades.
  - category: Sempre "Estoque de Chope".
  - unit: Interprete a unidade com base nas informações da linha. Se contiver "30L", use "barril 30L". Se for "50L", use "barril 50L". Se não houver, apenas "barril".
  - status: Deve ser "Cheio", "Meio" ou "Final". Se não tiver nada escrito na linha, assuma "Cheio".

Exemplo de estrutura JSON esperada (não inclua nenhuma explicação, apenas o JSON puro começando com [ e terminando com ]):

[
  {
    "name": "Pilsen 30L",
    "quantity": 3,
    "category": "Estoque de Chope",
    "unit": "barril 30L",
    "status": "Cheio"
  },
  {
    "name": "Pilsen 30L",
    "quantity": 1,
    "category": "Estoque de Chope",
    "unit": "barril 30L",
    "status": "Meio"
  }
]

### Texto da contagem:

"""
${contagemText}
"""
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um assistente especialista em interpretar contagens de estoque para um bar.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiContent = response.data.choices[0].message.content;

    const jsonStart = aiContent.indexOf('[');
    const jsonEnd = aiContent.lastIndexOf(']') + 1;
    const jsonText = aiContent.substring(jsonStart, jsonEnd);

    return JSON.parse(jsonText);

  } catch (error) {
    console.error('Erro ao processar contagem com OpenAI:', error.response?.data || error);
    throw new Error('Falha ao processar contagem com OpenAI');
  }
}
