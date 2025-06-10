// backend/index.js
require('dotenv').config();

// Garante que o Node use o fuso “America/Sao_Paulo” se não estiver definido
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes     = require('./routes/authRoutes');
const unitRoutes     = require('./routes/unitRoutes');
const stockRoutes    = require('./routes/stockRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes  = require('./routes/productRoutes');
const scanRoute      = require('./routes/scanInvoice');
const reportRoutes   = require('./routes/reportRoutes');
const { authenticate } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 4000;

// 1) Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// 2) Middlewares globais
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Rotas de autenticação (login, register)
app.use('/api/auth', authRoutes);

// 4) Rota única de scan de nota fiscal
//    - Apenas para /api/products/scan-invoice
app.use('/api/products/scan-invoice', scanRoute);

// 5) Rotas protegidas de unidades, estoque, categorias e fornecedores
app.use('/api/units',       authenticate, unitRoutes);
app.use('/api/stock',       authenticate, stockRoutes);
app.use('/api/categories',  authenticate, categoryRoutes);
app.use('/api/suppliers',   authenticate, supplierRoutes);

// 6) Rotas de CRUD de produtos (sem multer)
//    - Todas as operações normais em /api/products
app.use('/api/products', authenticate, productRoutes);

// 7) Rotas de relatórios
app.use('/api/reports', reportRoutes);

// 8) Rota raiz
app.get('/', (req, res) => {
  res.send('API de Estoque rodando');
});

// 9) 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// 10) Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// 11) Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Timezone corrente (servidor):', new Date().toLocaleString());
});
