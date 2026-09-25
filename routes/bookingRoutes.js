import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getOwnerBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getCustomerBookings);
router.get('/owner-bookings', authorize('owner', 'admin'), getOwnerBookings);
router.get('/admin/all', authorize('admin'), getAllBookings);

router.get('/:id', getBookingById);
router.put('/:id/status', authorize('owner', 'admin'), updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

export default router;
