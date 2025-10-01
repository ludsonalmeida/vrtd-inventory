// backend/index.js
require('dotenv').config();

// Fuso horário padrão
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

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

/* 1) Healthcheck MUITO cedo (o Railway usa isso pra checar se subiu) */
app.get('/health', (req, res) => res.status(200).send('ok'));

/* 2) Conexão MongoDB */
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    heartbeatFrequencyMS: 8000,
  })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

/* 3) CORS GLOBAL — antes de qualquer rota */
const allowedOrigins = [
  'http://localhost:5173',
  'https://sobradinhoporks.com.br',
  'https://api.sobradinhoporks.com.br',
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // permite curl/health sem Origin
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      // se você NÃO envia X-Request-Id do front, pode remover:
      'X-Request-Id',
    ],
    credentials: true, // deixe true só se usar cookies cross-site; caso contrário pode pôr false
    maxAge: 86400,
    preflightContinue: false, // padrão: o próprio cors responde 204
  })
);

// Handler explícito pro preflight apenas sob /api/* (compatível com path-to-regexp)
app.options('/api/*', cors());

/* 4) Body parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 5) Rotas de diagnóstico */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    tz: process.env.TZ,
    node: process.version,
  });
});

app.get('/api/_mailtest', async (req, res) => {
  try {
    const transporter = process.env.EMAIL_HOST
      ? nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 465),
          secure: String(process.env.EMAIL_SECURE || 'true') === 'true',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || 'ludson.bsa@gmail.com,porks.sobradinho@gmail.com',
      subject: 'Teste SMTP — PROD',
      text: 'Envio funcionando na produção ✔️',
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('[MAILTEST PROD]', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* 6) Rotas públicas */
app.use('/api/auth', authRoutes);
app.use('/api/products/scan-invoice', scanRoute);
app.use('/api/menu', menuPublicRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/reports', reportRoutes);

/* 7) Rotas protegidas — movimentos primeiro */
app.use('/api/stock/movements', authenticate, stockMovementRoutes);

/* 8) Rotas protegidas “genéricas” */
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/menu-items', authenticate, menuItemRoutes);
app.use('/api/units', authenticate, unitRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/suppliers', authenticate, supplierRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/products', authenticate, productRoutes);

/* 9) Rota raiz */
app.get('/', (req, res) => {
  res.send('API de Estoque rodando');
});

/* 10) 404 e handler de erro */
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err);
  // Garante CORS também em erros
  if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Vary', 'Origin');
  }
  res.status(500).json({ error: 'Erro interno no servidor' });
});

/* 11) Sobe o servidor — UMA vez, porta do Railway e 0.0.0.0 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on ${PORT}`);
  console.log('Timezone corrente (servidor):', new Date().toLocaleString());
});

/* (Opcional) Log útil pra caçar problemas de latência/status */
process.on('unhandledRejection', (e) => {
  console.error('[unhandledRejection]', e);
});
process.on('uncaughtException', (e) => {
  console.error('[uncaughtException]', e);
});
