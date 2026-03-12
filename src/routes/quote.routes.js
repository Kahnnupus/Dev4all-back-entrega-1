import { Router } from 'express';
import {
  createQuote, getQuotes, getMyQuotes, getQuote, updateQuoteStatus, deleteQuote,
} from '../controllers/quoteController.js';
import { protectRoute, optionalAuth } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { validate } from '../middlewares/validate.js';
import { createQuoteSchema, updateStatusSchema } from '../validators/quoteValidator.js';

const router = Router();


router.get('/my', protectRoute, getMyQuotes);

router.post('/', optionalAuth, validate(createQuoteSchema), createQuote);
router.get('/', protectRoute, adminOnly, getQuotes);
router.get('/:id', protectRoute, getQuote);
router.patch('/:id/status', protectRoute, adminOnly, validate(updateStatusSchema), updateQuoteStatus);
router.delete('/:id', protectRoute, adminOnly, deleteQuote);

export default router;
