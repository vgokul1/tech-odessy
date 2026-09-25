import express from 'express';
import {
  createReview,
  getEquipmentReviews,
  respondToReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/equipment/:equipmentId', getEquipmentReviews);
router.post('/', protect, createReview);
router.put('/:id/respond', protect, authorize('owner', 'admin'), respondToReview);

export default router;
