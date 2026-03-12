import { Router } from 'express';
import {
  getTeam, getTeamMember, createTeamMember, updateTeamMember, deleteTeamMember,
} from '../controllers/teamController.js';
import { protectRoute } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = Router();

router.get('/', getTeam);
router.get('/:id', getTeamMember);
router.post('/', protectRoute, adminOnly, createTeamMember);
router.patch('/:id', protectRoute, adminOnly, updateTeamMember);
router.delete('/:id', protectRoute, adminOnly, deleteTeamMember);

export default router;
