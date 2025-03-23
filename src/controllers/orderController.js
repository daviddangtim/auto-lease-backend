import Order from "../models/orderModel.js";
import { catchAsync } from "../utils/helpers.js";

export const createOrder = catchAsync(async (req, res, next) => {
  const payload = req.body;
  payload.user = req.user._id;

  const order = await Order.create({
    user: payload.user,
    car: payload.car,
    totalAmount: payload.totalAmount,
    paymentReference: payload.paymentReference,
  });

  res.status(201).json({
    status: "success",
    reference: order.paymentReference,
  });
});