import express from 'express';
import  bookingController from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middlewares/guard.js';
import { ADMIN } from '../utils/constants.js';
import { uploadFrontOfId } from '../middlewares/x.js';

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo(ADMIN), bookingController.getAllBookings);
router
  .route("/:id")
  .post(protect, upload.fields(
    [{ name: "frontOfId", maxCount: 1 },
    { name: "backofId", maxCOunt: 1 }]
  ), uploadFrontOfId, uploadFrontOfId, bookingController.createBooking);

export default router;