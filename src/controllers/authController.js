// TODO: REMOVE ALL CODES THAT SHOULD BE RUN ONLY ON DEV WHEN YOU ARE DONE WITH THE PROJECT
import AppError from "../utils/appError.js";
import Email from "../utils/email.js";
import { verify as jwtVerify } from "../utils/jwt.js";
import generateAndSendJwtCookie from "../utils/generateAndSendJwtCookie.js";
import sendConfirmationToken from "../utils/sendConfirmationToken.js";
import User from "../models/userModel.js";
import {
  baseUrl,
  catchAsync,
  createHash,
  filterObject,
  isProduction,
} from "../utils/utils.js";
import chalk from "chalk";

export const signUp = catchAsync(async (req, res, next) => {
  const payload = filterObject(req.body, [
    "name",
    "email",
    "password",
    "passwordConfirm",
  ]);

  const user = await User.create(payload);
  await sendConfirmationToken(req, res, next, user, 201);
});

export const requestConfirmationToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new AppError("No user found with this email.", 404));
  }

  if (user.isUserConfirmed) {
    return next(new AppError("User is already confirmed", 409));
  }

  await sendConfirmationToken(req, res, next, user);
});

export const confirmUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Token is required", 400));
  }

  const hashedToken = createHash(token);

  const user = await User.findOne({
    userConfirmationToken: hashedToken,
    userConfirmationTokenExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(new AppError("Token is incorrect or expired", 401));
  }

  await user.confirmUser();
  await new Email(user, `${baseUrl(req)}/api/v1/user/me`).sendWelcome();
  await generateAndSendJwtCookie(user, res);
});

export const signIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError("Password and email are required", 401));
  }

  const user = await User.findOne({ email }).select("+password").exec();

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect password or email", 401));
  }

  if (!user.isUserConfirmed && isProduction) {
    await sendConfirmationToken(req, res, next, user, 401);
  }

  try {
    const otp = await user.generateAndSaveOtp(); // TODO: SEND OTP VIA EMAIL
    await new Email(user, otp).sendOtp();

    res.status(200).send({
      statusText: "success",
      message: "OTP is sent to your email",
      otp: isProduction ? undefined : otp,
    });
  } catch (err) {
    await user.destroyOtp();
  }
});

export const verify = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(
      new AppError("OTP is required to verify it's you login in", 400),
    );
  }

  const user = await User.findOne({
    otp: createHash(otp),
    otpExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(new AppError("OTP is incorrect or expired", 401));
  }

  await user.destroyOtp();
  await generateAndSendJwtCookie(user, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new AppError("User with this email does not exits", 404));
  }

  const token = await user.generateAndSavePasswordResetToken();
  const url = `${baseUrl(req)}/auth/reset-password/${token}`;

  try {
    await new Email(user, url).sendPasswordReset();
    res.status(200).send({
      statusText: "success",
      message: `Please check the email address ${email} for instructions to reset your password`,
    });
  } catch (err) {
    await user.destroyPasswordResetToken();
    return next(new AppError("There was an error sending the email", 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Token is required", 400));
  }

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError("Password and password confirm are required", 401),
    );
  }
  const user = await User.findOne({
    passwordResetToken: createHash(token),
    passwordResetTokenExpires: { $gt: Date.now() },
  })
    .select("+password")
    .exec();

  if (!user) {
    return next(new AppError("Token is incorrect or expired", 401));
  }

  if (await user.comparePassword(password, user.password)) {
    return next(
      new AppError("new password cannot be same as old password.", 400),
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();
  await user.destroyPasswordResetToken();

  res.status(200).send({
    statusText: "success",
    message: "Password reset successful. Please log in with your new password.",
  });
});

export const protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Log in to get access", 401),
    );
  }

  const decoded = await jwtVerify(token);
  const user = await User.findById(decoded.id).exec();

  if (!user) {
    return next(
      new AppError("The user associated with this account no longer exits"),
      401,
    );
  }

  if (user.passwordChangedAfterJwt(decoded.isa)) {
    return next(new AppError("User recently changed password.", 401));
  }

  req.user = user;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    const user = req.user;

    if (!user.isUserConfirmed) {
      return next(
        new AppError(
          "Your account needs to be confirmed to access this resource",
          403,
        ),
      );
    }

    if (!roles.includes(user.role)) {
      return next(
        new AppError("You are not authorized to access this resource", 403),
      );
    }
    return next();
  };
