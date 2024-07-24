import mongoose from "mongoose";
import slugify from "slugify";
import { limitArrayLength } from "../utils/helpers.js";
import pointSchema from "./pointSchema.js";
import { CATEGORY } from "../utils/constants.js";
import { fileSchema } from "./fileSchema.js";

const { BASIC, CLASSIC, LUXURY } = CATEGORY;
const carSchema = new mongoose.Schema(
  {
    dealership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: [true, "A car must belong to a dealership"],
    },

    name: {
      type: String,
      trim: true,
      required: [true, "A car must have a name"],
      minlength: [3, "A car name must be at least 3 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    model: {
      type: String,
      trim: true,
      required: [true, "A car must have a model"],
      minlength: [3, "A car name must be at least 3 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    plateNumber: {
      type: String,
      trim: true,
      required: [true, "Plate Number is required"],
      match: [
        /^[A-Z]{3}-?\d{3}[A-Z]{2}$/,
        "Please enter a valid Nigerian plate number",
      ],
    },

    category: {
      type: String,
      enum: {
        values: [BASIC, CLASSIC, LUXURY],
        message: `Invalid category. Choose from: ${BASIC} and ${CLASSIC} and ${LUXURY}`,
      },
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
    slug: String,
    duration: {
      type: Date,
      required: [true, "A car must have a lease duration"],
    },
    coverImage: {
      type: fileSchema,
      required: true,
    },
    photos: {
      type: [fileSchema],
      required: [true, "A car must have at least a photo"],
      validate: [
        limitArrayLength(10, 1),
        "Photos array must contain between 1 and 10 items",
      ],
    },
    price: {
      type: Number,
      required: [true, "A car must have a price"],
      min: [0, "Price cannot be negative"],
    },
    fee: {
      type: Number,
      required: [true, "A car must have a lease fee"],
      validate: {
        validator: function (value) {
          const price =
            this.price !== undefined ? this.price : this.get("price");
          return price > value;
        },
        message: "Fee must be less than the price",
      },
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0 && v <= 100,
        message: "Discount must be between 0% to 100%",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

carSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "car",
});

carSchema.pre("save", function (next) {
  if (!this.isModified("slug")) {
    this.name = slugify(this.name, { lower: true });
  }
  next();
});

carSchema.pre("save", function (next) {
  next();
});

const Car = mongoose.model("Car", carSchema);

export default Car;
