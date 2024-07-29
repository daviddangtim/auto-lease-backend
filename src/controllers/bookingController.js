import Booking from '../models/bookingModel.js';
import Car from '../models/carModel.js';
import { catchAsync } from '../utils/helpers.js';
import AppError from '../utils/appError.js';

export const createBooking = catchAsync(async (req, res, next) => {
    const carId = req.params.id;

    const payload = req.body;
    payload.car = carId;

    const car = await Car.findById(carId);
    if (!car) {
        return next(new AppError('Car not found', 404));
    }

    const booking = await Booking.create(payload);

    res.status(201).json({
        status: 'success',
        data: {
            booking,
        },
    });
});

export const getAllBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find()
        .populate({
            path: 'car',
            select: 'name model coverImage summary',
        });

    if (!bookings) {
        return next(new AppError("No Bookings found", 404))
    }

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings,
        },
    });
});