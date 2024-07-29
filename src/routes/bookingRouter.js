import express from 'express';
import  * as bookingController from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middlewares/guard.js';
import { ROLES } from '../utils/constants.js';
import { uploadFrontOfId } from '../middlewares/x.js';
import { upload } from '../utils/imageUploader.js';

const {ADMIN} = ROLES;

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