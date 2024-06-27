import mongoose from "mongoose";
import slugify from "slugify";
import pointSchema from "./pointSchema.js";

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
      min: [0, "Ratings cannot be less than 0"],
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // cars: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Car",
    //   },
    // ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Review",
    //   },
    // ],
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

// dealershipSchema.pre("save", async function (next) {
//   const carPromises = this.cars.map(
//     async (id) => await User.findById(id).exec(),
//   );
//   this.cars = await Promise.all(carPromises);
//   next();
// });

const Dealership = mongoose.model("Dealership", dealershipSchema);
