const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Middleware de autenticação (JWT)
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (!token || (scheme && scheme.toLowerCase() !== 'bearer')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] Falta JWT_SECRET nas variáveis de ambiente');
      return res.status(500).json({ error: 'Configuração do servidor ausente (JWT_SECRET)' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    console.error('[AUTH] authenticate error:', err);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  // DEBUG: o que chega do front
  console.log('[AUTH] LOGIN BODY →', req.body);

  try {
    // 1) Validação de entrada
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      console.warn('[AUTH] Login recusado: email/password ausentes ou inválidos', {
        emailType: typeof email,
        passwordType: typeof password,
      });
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    if (password.length < 6) {
      console.warn('[AUTH] Login recusado: senha curta');
      return res.status(400).json({ error: 'Senha inválida' });
    }

    // 2) Garantir configuração do servidor
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] Falta JWT_SECRET no ambiente');
      return res.status(500).json({ error: 'Configuração do servidor ausente (JWT_SECRET)' });
    }

    // 3) Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // 4) Conferir se o hash existe
    if (!user.password || typeof user.password !== 'string') {
      console.error('[AUTH] Usuário sem hash de senha no banco', { userId: user._id, email: user.email });
      return res.status(500).json({ error: 'Configuração de credenciais inválida' });
    }

    // 5) Comparar senha
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (cmpErr) {
      console.error('[AUTH] Erro no bcrypt.compare (provável password undefined):', cmpErr);
      return res.status(500).json({ error: 'Erro interno ao validar credenciais' });
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // 6) Gerar token
    const payload = { userId: user._id, email: user.email, role: user.role };
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    } catch (signErr) {
      console.error('[AUTH] Erro no jwt.sign (verifique JWT_SECRET):', signErr);
      return res.status(500).json({ error: 'Erro ao gerar token' });
    }

    return res.json({
      token,
      user: { email: user.email, role: user.role, userId: user._id },
    });
  } catch (error) {
    console.error('[AUTH] Login error (catch):', error);
    return res.status(500).json({ error: 'Erro interno ao fazer login' });
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  console.log('[AUTH] REGISTER BODY →', req.body);

  try {  // <<< AQUI estava "try:" causando o syntax error
    // 1) Validação
    const { email, password, role } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // 2) Duplicidade
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // 3) Hash
    let hashed;
    try {
      hashed = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error('[AUTH] Erro ao gerar hash:', hashErr);
      return res.status(500).json({ error: 'Erro ao criar credenciais' });
    }

    // 4) Salvar
    const newUser = new User({
      email,
      password: hashed,
      role: role || 'user',
    });
    const saved = await newUser.save();

    return res.status(201).json({
      message: 'Usuário criado',
      user: { email: saved.email, role: saved.role, userId: saved._id },
    });
  } catch (error) {
    console.error('[AUTH] Register error (catch):', error);
    return res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
}

module.exports = { authenticate, login, register };
