import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { DEALERSHIP_APPLICATION_STATUS, ROLES } from "../utils/constants.js";
import pointSchema from "./pointSchema.js";

const { APPROVED, PENDING, REJECTED, REVOKED } = DEALERSHIP_APPLICATION_STATUS;
const { USER, DEALER, ADMIN, Driver } = ROLES;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [4, "name cannot be less than 4 characters"],
      maxlength: [50, "name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email address",
      },
    },
    role: {
      type: String,
      default: USER,
      enum: {
        values: [USER, DEALER, DEALER, ADMIN],
        message: `Invalid role. Choose from: ${USER},${DEALER}, ${Driver}, ${ADMIN}`,
      },
    },
    applicationStatus: {
      type: String,
      enum: {
        values: [APPROVED, PENDING, REJECTED],
        message: `Invalid dealership application status. Choose from: ${APPROVED}, ${PENDING}, ${REJECTED} and ${REVOKED}`,
      },
      select: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
      validate: {
        validator: (value) =>
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,50}$/.test(value),
        message: ({ value }) => {
          if (value.length < 8) {
            return "Password must be at least 8 characters";
          }
          if (value.length > 50) {
            return "Password must be at most 50 characters";
          }
          if (!/[A-Z]/.test(value)) {
            return "Password must contain at least one uppercase letter";
          }
          if (!/[!@#$%^&*]/.test(value)) {
            return "Password must contain at least one special character";
          }
          return "Invalid password";
        },
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, "Confirm password is required"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      select: false,
    },
    driversLicense: {
      type: String,
      select: false,
    },
    photo: String,
    photoId: String,
    location: pointSchema,
    isUserConfirmed: Boolean,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("password")) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
