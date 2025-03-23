import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
        required: [true, "An order must belong to a user"],
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "An order must have a car"],
    },
    totalAmount: {
      type: Number,
      required: [true, "An order must have a total amount"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid"],
        message: "Payment status must be either 'pending' or 'paid'",
      },
      default: "pending",
    },
    paymentReference: {
      type: String,
      required: [true, "An order must have a payment reference"],
    },
    },
    {
      timestamps: true,
    }
);

export default mongoose.model("Order", orderSchema);