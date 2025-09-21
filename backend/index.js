// backend/index.js
require('dotenv').config();
// Garante fuso “America/Sao_Paulo” se não estiver definido
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const unitRoutes = require('./routes/unitRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const scanRoute = require('./routes/scanInvoice');
const reportRoutes = require('./routes/reportRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const stockRoutes = require('./routes/stockRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const menuPublicRoutes = require('./routes/menuPublicRoutes');

const { authenticate } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 4000;

// 1) Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// 2) Middlewares globais
app.use(cors({
  origin: [
    'http://localhost:5173',          // dev
    'https://sobradinhoporks.com.br', // front prod
    'https://api.sobradinhoporks.com.br'  // caso chame direto
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/products/scan-invoice', scanRoute);

// 4) Rotas protegidas de estoque MOVEMENTS **primeiro**
app.use('/api/stock/movements', authenticate, stockMovementRoutes);

// 5) Rotas protegidas de estoque “genéricas” (inclui GET /api/stock, /api/stock/:id, etc)
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/menu', menuPublicRoutes);
app.use('/api/menu-items', authenticate, menuItemRoutes);

// 6) Outras rotas protegidas
app.use('/api/units', authenticate, unitRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/suppliers', authenticate, supplierRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/products', authenticate, productRoutes);

app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/reports', reportRoutes);

// 7) Rota raiz
app.get('/', (req, res) => {
  res.send('API de Estoque rodando');
});

// 8) 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// 9) Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// index.js (antes do 404)
app.get('/api/_mailtest', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    const t = process.env.EMAIL_HOST
      ? nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 465),
          secure: String(process.env.EMAIL_SECURE || 'true') === 'true',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        })
      : nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await t.verify();
    const info = await t.sendMail({
      from: process.env.EMAIL_USER, // importante p/ Gmail
      to: process.env.EMAIL_TO || 'ludson.bsa@gmail.com,porks.sobradinho@gmail.com',
      subject: 'Teste SMTP — PROD',
      text: 'Envio funcionando na produção ✔️'
    });
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) { console.error('[MAILTEST PROD]', e); res.status(500).json({ ok:false, error:String(e) }); }
});


// 10) Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Timezone corrente (servidor):', new Date().toLocaleString());
});


