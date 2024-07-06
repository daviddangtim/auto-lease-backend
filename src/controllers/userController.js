import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import {cloudinary, upload} from "../utils/imageUploader.js";
import { DEALERSHIP_APPLICATION_STATUS, ROLES } from "../utils/constants.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";
import {comparePassword} from "../utils/userHelper.js";

const { APPROVED, PENDING, REJECTED } = DEALERSHIP_APPLICATION_STATUS;
const { DEALER } = ROLES;

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, password, passwordConfirm } = req.body;

 const confirmation =  await comparePassword(currentPassword, user.password)

  if (!confirmation) {
    // TODO: NOTICE THE ERROR THAT OCCURS WHEN NO PAYLOAD IS PASSES SO THAT IT CAN BE HANDLED IN THE ERROR MIDDLEWARE
    return next(new AppError("Current password is incorrect", 401));
  }
  if(confirmation){
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
  const {image} = req.file;
  const user = await findById(req.user._id);
  await cloudinary.uploader.destroy(user.photoId);
 const result = await cloudinary.uploader.upload(image);

 if (!result) {
    return next(new AppError("Unable to upload image", 500));
  }

  user.photo = result.secure_url;
  user.photoId = result.public_id;

  await user.save()

  res.status(200)
      .json({
        statusText:"Success",
        data:{
          user
        }
      })

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
    statusText: "success",
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
