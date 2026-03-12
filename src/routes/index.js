import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import quoteRoutes from './quote.routes.js';
import teamRoutes from './team.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/quotes', quoteRoutes);
router.use('/team', teamRoutes);

export default router;
