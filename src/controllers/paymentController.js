import AppError from "../utils/appError.js";
import {createHmac} from "crypto";
import { catchAsync } from "../utils/helpers.js";
import Order from "../models/orderModel.js";

export const paystackWebHook = catchAsync(async (req, res, next) => {
const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
.update(JSON.stringify(req.body))
.digest("hex");

if (hash !== req.headers["x-paystack-signature"]) {
    return next(new AppError("Invalid signature", 400));
}

const payload = req.body;

if (payload.event === "charge.success") {
    const reference = payload.data.reference;

    const order = await Order.findOne({ paymentReference: reference });

    if (order) {
        order.paymentStatus = "paid";
        await order.save();
    }
    
}
res.status(200).json({
    status: "success",
    message: "Webhook received",});

});