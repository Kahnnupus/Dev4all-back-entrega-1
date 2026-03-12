import User from '../models/User.js';
import { signToken } from '../config/jwt.js';
import { catchAsync } from '../middlewares/errorHandler.js';

// POST /api/auth/register
export const register = catchAsync(async (req, res) => {
  const { nomeCompleto, email, senha } = req.body;

  const user = await User.create({ nomeCompleto, email, senha });
  const token = signToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Conta criada com sucesso!',
    data: {
      token,
      user: {
        id: user._id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// POST /api/auth/login
export const login = catchAsync(async (req, res) => {
  const { email, senha } = req.body;

  // Busca com senha (campo select:false)
  const user = await User.findOne({ email, ativo: true }).select('+senha');
  if (!user || !(await user.senhaCorreta(senha))) {
    return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
  }

  const token = signToken(user._id, user.role);

  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    data: {
      token,
      user: {
        id: user._id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// GET /api/auth/me
export const getMe = catchAsync(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// POST /api/auth/forgot-password (stub)
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Por segurança, sempre retorna 200 (não revela se email existe)
  res.json({
    success: true,
    message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.',
  });
});
