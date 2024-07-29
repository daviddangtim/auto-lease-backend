import mongoose from 'mongoose';
import { fileSchema } from './fileSchema.js'; // Adjust the path as needed

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Booking must be associated with a car'],
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
      default: 1000, // Flat rate for delivery
    },
   frontOfId:{
    type:fileSchema,
   },
   backOfId:{
    type:fileSchema,
   },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Populate car details when querying bookings
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'car',
    select: 'summary coverImage name model',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;