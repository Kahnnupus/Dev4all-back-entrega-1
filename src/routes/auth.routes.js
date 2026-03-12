import { Router } from 'express';
import { register, login, getMe, forgotPassword } from '../controllers/authController.js';
import { protectRoute } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/userValidator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protectRoute, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
