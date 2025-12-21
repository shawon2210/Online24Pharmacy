import express from 'express';
import {
  createSavedKit,
  getSavedKits,
  getSavedKitById,
  deleteSavedKit,
} from '../controllers/savedKitController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.route('/')
  .post(createSavedKit)
  .get(getSavedKits);

router.route('/:id')
  .get(getSavedKitById)
  .delete(deleteSavedKit);

export default router;
