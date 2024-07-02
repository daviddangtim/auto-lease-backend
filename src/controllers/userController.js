import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { DEALERSHIP_APPLICATION_STATUS, ROLES } from "../utils/constants.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";

const { APPROVED, PENDING, REJECTED } = DEALERSHIP_APPLICATION_STATUS;
const { DEALER } = ROLES;

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const date = new Date();
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "Internal Server Error" });
  }

  await Promise.all(() => {
    // WHY ARE YOU USING A PROMISE HERE?
    user.passwordChangedAt = date.now(); // WE DONT NEED THIS BECAUSE BECAUSE IT'S HANDLES BY A MIDDLEWARE
    user.password = password;
  });

  await user.save();

  res.status(200).json({ message: "Password Updated Successfully" });
});

export const updateMyPasswordV1 = catchAsync(async (req, res, next) => {
  // GET THE CURRENT USER FROM THE REQUEST OBJECT PASSED BY PROTECT
  const { user } = req;
  const { currentPassword, password, passwordConfirm } = req.body;

  // COMPARE THE PASSWORDS
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // UPDATE THE PASSWORD
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save(); // IF VALIDATION FAILS OUR GLOBAL HANDLING MIDDLEWARE WILL TAKE OVER

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const updateProfilePhoto = catchAsync(async (req, res, next) => {});

export const updateMe = catchAsync(async (req, res, next) => {
  const updates = {};

  if (req.body.name) {
    updates.name = req.body.name;
  }

  if (req.body.email) {
    updates.email = req.body.email;
  }

  const user = findByIdAndUpdate(req.user._id, { $set: { updates } });
  if (user.nModified === 0) {
    return res
      .status(404)
      .json({ message: "Unable to update fields because they were not found" });
  }

  await user.save();
  res.status(200).json({ message: "Details Updated Successfully" });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const user = findByIdAndDelete(req.user._id);

  await user.save();

  res.status(200).json({ message: "User deleted " });
});

export const applyForDealership = catchAsync(async (req, res, next) => {
  const { user } = req;

  if (user.dealershipApplicationStatus === PENDING) {
    return next(
      new AppError(
        "Your application is currently pending. Please wait for it to be processed.",
        400,
      ),
    );
  }

  user.dealershipApplicationStatus = PENDING;
  await user.save({ validateBeforeSave: false });
  await new Email(user).sendApplyDealership();

  res.status(200).json({
    status: "success",
    message:
      "Your dealership application has been submitted successfully and is now pending review.",
    data: { user },
  });
});

export const approveDealership = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).exec();

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (user.role === DEALER) {
    return next("User is already a Dealer", 403);
  }

  if (user.dealershipApplicationStatus === REJECTED) {
    return next(new AppError("User is already rejected. Apply again", 403));
  }

  user.dealershipApplicationStatus = undefined;
  user.isApplyForDealership = undefined;
  user.role = ROLES.DEALER;
  await user.save({ validateBeforeSave: false });
});

export const dealershipApplication = (action) =>
  catchAsync(async (req, res, next) => {
    const { user } = req;
    const { reason } = req.body;

    switch (action) {
      case "apply":
        if (user.dealershipApplicationStatus === PENDING) {
          return next(new AppError("Your application is pending. wait"));
        }

        user.isApplyForDealership = true;
        user.dealershipApplicationStatus = PENDING;
        await user.save({ validateBeforeSave: false });
        await new Email(user).sendApplyDealership();
        break;

      case "reject":
        user.dealershipApplicationStatus = REJECTED;

        if (!user.isApplyForDealership) {
          return next(new AppError("User has not applied for a dealership"));
        }

        if ((user.role = DEALER)) {
          return next(
            new AppError(
              "User is already approved. To Revoke an approved user, use the appropriate route",
            ),
          );
        }

        await user.save({ validateBeforeSave: false });
        await new Email(user, { reason });
        break;

      case "approve":
        user.dealershipApplicationStatus = APPROVED;
        break;

      case "revoke":
        user.dealershipApplicationStatus = REJECTED;
        break;

      default:
        throw new AppError("Unknown action", 500);
    }

    res.status(200).json({
      statusText: "success",
      data: { user },
    });
  });
