import express from 'express';
import { createBooking, getAllBookings } from '../controllers/bookingController.js'; 
import { protect } from '../middlewares/guard.js';
import restrictTo from '../middlewares/restrictTo.js';
import { ADMIN } from '../utils/constants.js';

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo(ADMIN), getAllBookings); 
router
.route("/:id")
.post(protect, createBooking);

export default router;