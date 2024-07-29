import Booking from '../models/bookingModel.js'; 
import Car from '../models/carModel.js'; 
import {catchAsync} from '../utils/helpers.js';
import AppError from '../utils/appError.js'; 

// Create a new booking
export const createBooking = catchAsync(async (req, res, next) => {
  const { carId, pickupDate, dropoffDate, files } = req.body;

  // Check if the car exists
  const car = await Car.findById(carId);
  if (!car) {
    return next(new AppError('Car not found', 404));
  }

  // Create the booking
  const booking = await Booking.create({
    car: carId,
    pickupDate,
    dropoffDate,
    files,
  });

  // Respond with the created booking
  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

// Get all bookings with populated car details
export const getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate({
      path: 'car',
      select: 'name model coverImage summary', // Select only the fields you need
    });

  // Respond with the list of bookings
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});