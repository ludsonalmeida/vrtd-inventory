const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Middleware de autenticação (JWT)
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  // DEBUG: ver o que está chegando
  console.log('LOGIN RECEIVED BODY →', req.body);

  try {
    const { email, password } = req.body;

    // (Já validamos formato e não vazio no middleware express-validator)

    const user = await User.findOne({ email });
    if (!user) {
      // Se não encontrou, retorna 401 sem dizer qual dos dois está errado
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Comparar a senha recebida com o hash no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Se chegou aqui, e-mail/senha estão corretos
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      user: { email: user.email, role: user.role, userId: user._id }
    });
  } catch (error) {
    console.error('Erro interno ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno ao fazer login' });
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  // DEBUG: ver o que está chegando
  console.log('REGISTER RECEIVED BODY →', req.body);

  try {
    const { email, password, role } = req.body;

    // Verificar se já existe
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar hash da senha
    const hashed = await bcrypt.hash(password, 10);

    // Salvar novo usuário
    const newUser = new User({
      email,
      password: hashed,
      role: role || 'user'
    });
    const saved = await newUser.save();

    return res.status(201).json({
      message: 'Usuário criado',
      user: { email: saved.email, role: saved.role, userId: saved._id }
    });
  } catch (error) {
    console.error('Erro interno ao registrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
}

module.exports = { authenticate, login, register };
