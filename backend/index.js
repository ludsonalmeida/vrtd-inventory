// backend/index.js
require('dotenv').config();

// Garante que o Node use o fuso “America/Sao_Paulo” se não estiver definido
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

const { authenticate } = require('./controllers/authController');


const app = express();
const PORT = process.env.PORT || 4000;

// 1) Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// 2) Middlewares globais
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Rotas de autenticação (login, register)
app.use('/api/auth', authRoutes);

// 4) Rotas de unidades de medida (exige autenticação)
app.use('/api/units', authenticate, unitRoutes);

// 5) Rotas de estoque e categorias (protegidas)
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/suppliers', authenticate, supplierRoutes);

// 6) Rota raiz
app.get('/', (req, res) => {
  res.send('API de Estoque rodando');
});

// 7) 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// 8) Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// 9) Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Timezone corrente (servidor):', new Date().toLocaleString());
});
