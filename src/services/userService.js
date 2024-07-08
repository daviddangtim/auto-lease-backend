import {
  BASE_URL,
  DEALERSHIP_APPLICATION_STATUS,
  ROLES,
} from "../utils/constants.js";
import AppError from "../utils/appError.js";
import { createDealership } from "./dealershipService.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";
import { isProduction } from "../utils/helpers.js";
import User from "../models/userModel.js";
import { comparePassword } from "../utils/userHelper.js";

const { PENDING, REVOKED, REJECTED, APPROVED } = DEALERSHIP_APPLICATION_STATUS;
const { DEALER, USER } = ROLES;

export const updateMyPassword = async (user, reqBody) => {
  const { currentPassword, password, passwordConfirm } = reqBody;

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  return { user };
};

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

  if (user.applicationStatus === REJECTED) {
    throw new AppError("User's application was rejected", 403);
  }

  if (user.applicationStatus === "approved") {
    throw new AppError("User is already a dealer", 409);
  }

  const dealership = await Dealership.findOne({ owner: userId })
    .select("+isApproved")
    .setOptions({ bypass: true })
    .exec();

  if (!dealership) {
    throw new AppError("No dealership associated with this user");
  }

  // update user's and dealership status
  dealership.isApproved = true;
  user.applicationStatus = APPROVED;
  user.role = DEALER;

  try {
    await Promise.all([
      user.save({ validateBeforeSave: false }),
      dealership.save({ validateBeforeSave: false }),
    ]);

    try {
      await new Email(user, { url: `${BASE_URL}/` }).sendApprovedDealership();
    } catch (err) {
      console.log(`There was an error sending the mail: ${err}`);
    }

    return { dealership, user };
  } catch (err) {
    // Compensation action if there was an error approving
    user.applicationStatus = PENDING;
    user.role = USER;
    dealership.isApproved = false;

    throw new AppError("There was an error approving the dealership", 500);
  }
};

export const rejectDealership = async (userId, reason) => {
  if (!reason) {
    throw new AppError(
      "You cannot reject a dealership application without a reason",
      400,
    );
  }

  const user = await User.findById(userId).select("+applicationStatus").exec();

  if (!user) {
    throw new AppError("No user found with this ID", 404);
  }

  if (user.applicationStatus === REJECTED) {
    throw new AppError(
      "Application for this user has already been rejected",
      403,
    );
  }

  if (user.role === DEALER) {
    throw new AppError(
      "This user is already a dealer. Use the /dealership/user/revoke endpoint to revoke their dealership status.",
      403,
    );
  }

  user.applicationStatus = REJECTED;
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, { reason }).sendRejectDealership();
  } catch (err) {
    console.log(`There was an error sending the mail: ${err}`);
  }

  return { user };
};

export const revokeDealership = async (userId, reason) => {
  if (!reason) {
    throw new AppError(
      "You cannot revoke a dealership application without a reason",
      400,
    );
  }

  const user = await User.findById(userId).select("+applicationStatus").exec();

  if (!user) {
    throw new AppError("No user found with this ID", 404);
  }

  if (user.role !== DEALER) {
    throw new AppError("User is not a dealer", 403);
  }

  const dealership = await Dealership.findOne({ owner: userId })
    .select("+isApproved")
    .exec();

  if (!dealership) {
    throw new AppError("No dealership associated with this user");
  }

  user.role = USER;
  user.applicationStatus = REVOKED;
  dealership.isApproved = false;

  try {
    await Promise.all([
      user.save({ validateBeforeSave: false }),
      dealership.save({ validateBeforeSave: false }),
    ]);

    try {
      await new Email(user, { reason }).sendRevokeDealership();
    } catch (err) {
      console.log(`There was an error sending the mail: ${err}`);
    }

    return { dealership, user };
  } catch (err) {
    user.role = DEALER;
    dealership.isApproved = true;

    await Promise.all([
      user.save({ validateBeforeSave: false }),
      dealership.save({ validateBeforeSave: false }),
    ]);

    throw new AppError("There was an error revoking the dealership", 500);
  }
};
