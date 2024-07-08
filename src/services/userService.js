import { DEALERSHIP_APPLICATION_STATUS, ROLES } from "../utils/constants.js";
import AppError from "../utils/appError.js";
import { createDealership } from "./dealershipService.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";
import { isProduction } from "../utils/helpers.js";
import User from "../models/userModel.js";

const { PENDING, REVOKED, REJECTED, APPROVED } = DEALERSHIP_APPLICATION_STATUS;
const { DEALER } = ROLES;

export const applyForDealership = async (reqBody, user) => {
  if (user.applicationStatus === PENDING) {
    throw new AppError(
      "Your dealership application is currently pending review. Please wait for it to be processed.",
      400,
    );
  }

  if (user.applicationStatus === APPROVED) {
    throw new AppError("You are already registered as a dealer.", 409);
  }

  try {
    user.applicationStatus = PENDING;
    await user.save({ validateBeforeSave: false });

    const { dealership } = await createDealership(reqBody, user.id, {
      currentUser: user,
    });

    try {
      await new Email(user).sendApplyDealership();
    } catch (err) {
      console.error("Failed to send email:", err);
    }

    return {
      message:
        "Your dealership application has been submitted successfully and is now pending review.",
      user,
      dealership,
    };
  } catch (err) {
    user.applicationStatus = undefined;
    await user.save({ validateBeforeSave: false });

    // Deleting the dealership if it was created
    await Dealership.findByIdAndDelete(
      { owner: user.id },
      { lean: true },
    ).exec();

    throw new AppError(
      isProduction
        ? "An error occurred while submitting your dealership application. Please try again."
        : err.message,
      500,
    );
  }
};

export const approveDealership = async (userId) => {
  const user = await User.findById(userId).select("+applicationStatus").exec();

  if (!user) {
    throw new AppError("No user found with this ID", 404);
  }

  if (user.applicationStatus !== PENDING) {
    throw new AppError("User did not apply for a dealership", 403);
  }

  if (user.role === DEALER) {
    throw new AppError("User is already a dealer", 409);
  }

  if (user.applicationStatus === REJECTED) {
    throw new AppError("User's application was rejected", 403);
  }

  try {
  } catch (err) {}
};
