import mongoose from "mongoose";
import slugify from "slugify";
import pointSchema from "./pointSchema.js";

export const dealershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "This name is already in use"],
      trim: true,
      minlength: [4, "Dealership Name must be at least 4 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    cacCertificate: {
      type: String,
      select: false,
      required: [true, "A dealership must have a valid CAC certificate"],
    },
    dealershipLicence: {
      type: String,
      select: false,
      required: [
        true,
        "A dealership must have a valid valid Dealership Licence",
      ],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot be more than 500 characters"],
      minLength: [200, "Description cannot be less than 200 characters"],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Summary is required"],
      maxlength: [150, "Summary cannot be more than 150 characters"],
      minLength: [50, "Summary cannot be less than 50 characters"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, "Ratings quantity cannot be less than 0"],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Ratings Average cannot be less than 0"],
      max: [5, "Ratings average cannot be more than 5"],
    },
    startLocation: {
      type: pointSchema,
      required: [true, "Start location is required"],
      index: "2dsphere",
    },
    coverImage: {
      type: String,
      required: ["A Dealership must have a cover image"],
    },
    photos: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A dealership must have a owner"],
    },
    cars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
    ],
    deliveryAgent: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    isApproved: {
      type: Boolean,
      select: false,
    },
    isRejected: {
      type: Boolean,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    locations: [pointSchema],
    slug: String,
  },
  { timestamps: true },
);

dealershipSchema.pre("save", function (next) {
  if (!this.isModified("slug")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

dealershipSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "name photo -_id",
  });
  next();
});

const Dealership = mongoose.model("Dealership", dealershipSchema);

export default Dealership;
