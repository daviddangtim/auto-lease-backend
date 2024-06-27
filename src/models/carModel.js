import mongoose from "mongoose";
import slugify from "slugify";

const carSchema = new mongoose.Schema(
  {
      dealership :{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dealership",
          required: [true, "A car must have a dealership"],
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
      required: [true, "A car must have a model name"],
      minlength: [3, "A car name must be at least 3 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    vin: {
      type: String,
      trim: true,
      required: [true, "A car must have a VIN"],
      unique: true,
      validate: {
        validator: (v) => /^[A-HJ-NPR-Z0-9]{17}$/.test(v),
        message: (props) => `${props.value} is not a valid VIN!`,
      },
    },
    imei: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => /^\d{15}$/.test(v),
        message: (props) => `${props.value} is not a valid IMEI!`,
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
    slug: String,
    duration: {
      type: Date,
      required: [true, "A car must have a lease duration"],
    },
    photos: {
      type: [String],
      required: [true, "A car must have at least a photo"],
      // TODO: confirm the maximum amount of photos each cars can have
    },
      photosId:{
        type: [String],
        required:[true,"A car photo must have an id"]
      },
    price: {
      type: Number,
      required: [true, "A car must have a price"],
    },
    discount: {
      type: Number,
      validate: {
        validator: (v) => v >= 0 && v <= 100,
        message: "Discount must be between 0% to 100%",
      },
    },
  },
  { timestamps: true },
);

carSchema.pre("save", function (next) {
  if (!this.isModified("slug")) {
    this.name = slugify(this.name, { lower: true });
  }
  next();
});

const Car = mongoose.model("Car", carSchema);

export default Car;
