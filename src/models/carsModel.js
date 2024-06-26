import mongoose from "mongoose"

const carSchema = new mongoose.Schema(
  {

  },
  { timestamps: true },
);

const Dealership = mongoose.model("Dealership", dealershipSchema);