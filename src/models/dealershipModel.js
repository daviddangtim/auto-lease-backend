import mongoose from "mongoose";

const dealershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "This name is already in use"],
      trim: true,
      minlength: [4, "Dealership Name must be at least 4 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"],
      validate: {
        validator: (value) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(value),
        message:
          "Name must start with a letter and can only contain letters and numbers without spaces or special characters",
      },
    },
    numRatings: {
      type: Number,
      default: 0,
      min:[]
    },
    ratingsAverage: {
      type: Number,
    }
  },
  { timestamps: true },
);
