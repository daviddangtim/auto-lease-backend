import mongoose, { model } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating average cannot be more than 5"],
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "A review must belong to a car"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A review must have a user"],
    },
    isUpdated: Boolean,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  this.populate({
    path: "dealership",
    select: "name",
  });
  next();
});

const Review = model("Review", reviewSchema);

export default Review;
