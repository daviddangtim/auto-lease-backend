import mongoose from 'mongoose';
import { fileSchema } from './fileSchema.js'; // Adjust the path as needed

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Booking must be associated with a car'],
    },
    pickupTime: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    dropoffDate: {
      type: Date,
      required: [true, 'Drop-off date is required'],
    },
    deliveryFee: {
      type: Number,
    },
  },
  {
    timestamps: true
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'car',
    select: 'summary coverImage name model owner',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;