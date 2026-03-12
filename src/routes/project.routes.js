import { Router } from 'express';
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
} from '../controllers/projectController.js';
import { protectRoute } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { validate } from '../middlewares/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', protectRoute, adminOnly, validate(createProjectSchema), createProject);
router.patch('/:id', protectRoute, adminOnly, validate(updateProjectSchema), updateProject);
router.delete('/:id', protectRoute, adminOnly, deleteProject);

export default router;
