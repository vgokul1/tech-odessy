import express from 'express';
import {
  getEquipment,
  getSingleEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getOwnerEquipment,
  checkEquipmentAvailability,
} from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getEquipment)
  .post(protect, authorize('owner', 'admin'), createEquipment);

router.get('/owner/me', protect, authorize('owner', 'admin'), getOwnerEquipment);
router.post('/:id/check-availability', checkEquipmentAvailability);

router
  .route('/:id')
  .get(getSingleEquipment)
  .put(protect, authorize('owner', 'admin'), updateEquipment)
  .delete(protect, authorize('owner', 'admin'), deleteEquipment);

export default router;
