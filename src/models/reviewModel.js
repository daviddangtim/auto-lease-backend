import mongoose, { model } from "mongoose";
import Car from "./carModel.js";

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
    path: "car",
    select: "name",
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (carId) {
  const statsArr = await this.aggregate([
    { $match: { car: carId } },
    {
      $group: {
        _id: "$car",
        nRating: { $sum: 1 },
        avRating: { $avg: "$rating" },
      },
    },
  ]);

  const [stats] = statsArr;
  await Car.findByIdAndUpdate(
    carId,
    {
      ratingsAverage: stats.avRating,
      ratingsQuantity: stats.nRating,
    },
    { lean: true, includeResultMetadata: true },
  );
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.car);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.model.findOne(this.getQuery());
  next();
});
reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calcAverageRating(this.doc.car._id);
});

const Review = model("Review", reviewSchema);

export default Review;
