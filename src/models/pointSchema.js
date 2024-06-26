import mongoose from "mongoose";

const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  const [longitude, latitude] = coordinates;
  return (
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
  );
};

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "A type is required"],
    default: "Point",
    enum: {
      values: ["Point"],
      message: "Location type must be 'Point'",
    },
  },
  coordinates: {
    type: [Number],
    required: [true, "Coordinates are required in [lng, lat] format"],
    validate: {
      validator: validateCoordinates,
      message: "Coordinates must be valid longitude and latitude values",
    },
  },
  address: String,
  description: String,
});

export default PointSchema;
