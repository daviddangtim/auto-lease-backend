import { catchAsync, filterObject, isProduction } from "../utils/helpers.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { cloudinary, upload } from "../utils/imageUploader.js";
import { DEALERSHIP_APPLICATION_STATUS, ROLES } from "../utils/constants.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";
import { comparePassword } from "../utils/userHelper.js";
import * as userService from "../services/userService.js";

const { APPROVED, PENDING, REJECTED } = DEALERSHIP_APPLICATION_STATUS;
const { DEALER } = ROLES;

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, password, passwordConfirm } = req.body;

  const confirmation = await comparePassword(currentPassword, user.password);

  if (!confirmation) {
    // TODO: NOTICE THE ERROR THAT OCCURS WHEN NO PAYLOAD IS PASSES SO THAT IT CAN BE HANDLED IN THE ERROR MIDDLEWARE
    return next(new AppError("Current password is incorrect", 401));
  }
  if (confirmation) {
    user.password = password;
    user.passwordConfirm = passwordConfirm;
  }

  await user.save();

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const updateMyPasswordV1 = catchAsync(async (req, res, next) => {
  // GET THE CURRENT USER FROM THE REQUEST OBJECT PASSED BY PROTECT
  const { user } = req;
  const { currentPassword, password, passwordConfirm } = req.body;

  // COMPARE THE PASSWORDS
  if (!(await user.comparePassword(currentPassword, user.password))) {
    // TODO: NOTICE THE ERROR THAT OCCURS WHEN NO PAYLOAD IS PASSES SO THAT IT CAN BE HANDLED IN THE ERROR MIDDLEWARE
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

export const updateProfilePhoto = catchAsync(async (req, res, next) => {
  const { image } = req.file;
  const user = await findById(req.user._id);
  await cloudinary.uploader.destroy(user.photoId);
  const result = await cloudinary.uploader.upload(image);

  if (!result) {
    return next(new AppError("Unable to upload image", 500));
  }

  user.photo = result.secure_url;
  user.photoId = result.public_id;

  await user.save();

  res.status(200).json({
    statusText: "Success",
    data: {
      user,
    },
  });
});

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
  const { message } = await userService.applyForDealership(req.body, req.user);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const approveDealership = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).exec();

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (user.dealershipApplicationStatus !== PENDING) {
    return next(
      new AppError(
        "User did not apply for a dealership or is already dealer",
        403,
      ),
    );
  }

  if (user.role === DEALER) {
    return next("User is already a Dealer", 403);
  }

  if (user.dealershipApplicationStatus === REJECTED) {
    return next(new AppError("User is already rejected. Apply again", 403));
  }

  const dealership = await Dealership.findOne({ owner: userId })
    .setOptions({ bypass: true })
    .exec();

  dealership.isApproved = true;
  user.dealershipApplicationStatus = undefined;
  user.role = DEALER;

  try {
    await user.save({ validateBeforeSave: false });
    await dealership.save({ validateBeforeSave: false });
    await new Email(user, { url: "" }).sendApprovedDealership();

    res.status(200).json({
      statusText: "success",
      data: { user },
    });
  } catch (err) {
    return next(
      new AppError(
        "There was an error processing your request. Try again",
        500,
      ),
    );
  }
});

export const rejectDealership = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { reason } = req.body;

  if (!reason) {
    return next(
      new AppError(
        "Please provide a reason for rejecting the dealership application.",
        400,
      ),
    );
  }

  const user = await User.findById(userId).select("+dealership").exec();

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (user.dealershipApplicationStatus === REJECTED) {
    return next(
      new AppError(
        "Dealership application for this user has already been rejected.",
        403,
      ),
    );
  }

  if (user.role === DEALER) {
    return next(
      new AppError(
        "This user is already a dealer. Use the /dealership/user/revoke endpoint to revoke their dealership status.",
        403,
      ),
    );
  }

  user.dealershipApplicationStatus = REJECTED;
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, { reason }).sendRejectDealership();
    res.status(200).json({
      statusText: "success",
      data: { user },
    });
  } catch (err) {
    return next(
      new AppError(
        "An error occurred while sending the rejection email. Please try again later.",
        500,
      ),
    );
  }
});

export const revokeDealership = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { reason } = req.body;

  if (!reason) {
    return next(
      new AppError(
        "You cannot revoke a dealership application without a reason",
        400,
      ),
    );
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (!user.role === DEALER) {
    return next(new AppError("User is not a dealer", 403));
  }
});
