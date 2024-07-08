import { catchAsync } from "../utils/helpers.js";
import AppError from "../utils/appError.js";
import { cloudinary } from "../utils/imageUploader.js";
import * as userService from "../services/userService.js";

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

export const updateMyPassword = catchAsync(async (req, res) => {
  const { user } = await userService.updateMyPassword(user, req.body);

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const updateMe = catchAsync(async (req, res) => {
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

export const applyForDealership = catchAsync(async (req, res) => {
  const { message } = await userService.applyForDealership(req.body, req.user);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const approveDealership = catchAsync(async (req, res) => {
  const { user } = await userService.approveDealership(req.params.id);

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const rejectDealership = catchAsync(async (req, res) => {
  const { user } = await userService.rejectDealership(
    req.params.id,
    req.body.reason,
  );

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const revokeDealership = catchAsync(async (req, res) => {
  const { user } = await userService.revokeDealership(
    req.params.id,
    req.body.reason,
  );

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});
