import AppError from "../utils/appError.js";
import { verify } from "../utils/jwt.js";
import generateAndSendJwtCookie from "../utils/generateAndSendJwtCookie.js";
import User from "../models/userModel.js";

import {
  baseUrl,
  catchAsync,
  createHash,
  filterObject,
  isProduction,
} from "../utils/utils.js";

// TODO: REMOVE ALL CODES THAT SHOULD BE RUN ONLY ON DEV WHEN YOU ARE DONE WITH THE PROJECT

export const signUp = catchAsync(async (req, res, next) => {
  const payload = filterObject(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
  );

  const user = await User.create(payload);
  const token = await user.generateAndSaveUserConfirmationToken();
  const url = `${baseUrl(req)}/confirm-user/${token}`;

  await generateAndSendJwtCookie(
    user,
    res,
    -`${isProduction ? "Confirmation token is sent to your email" : token}`,
    201,
  ); // TODO: IMPLEMENT EMAIL FUNCTIONALITY TO SEND THE CONFIRMATION TOKEN
});

export const requestConfirmationToken = catchAsync(async (req, res, next) => {
  let { user } = req;
  let token;

  if (user) {
    if (user.isUserConfirmed) {
      return next(new AppError("User is already confirmed", 409));
    }
    token = await user.generateAndSaveUserConfirmationToken();
  } else {
    // If a user is not logged in but want to be verified this will  handle that
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    user = await User.findOne({ email }).select("+password").exec();

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    if (user.isUserConfirmed) {
      return next(new AppError("User is already confirmed", 409));
    }

    token = await user.generateAndSaveUserConfirmationToken();
  }

  const url = `${baseUrl(req)}/confirm-user/${token}`;
  res.status(200).json({
    statusText: "success",
    message: `${isProduction ? "Confirmation token is sent to your email" : token}`,
  }); // TODO: IMPLEMENT EMAIL FUNCTIONALITY TO SEND THE CONFIRMATION TOKEN
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

  user.isUserConfirmed = true;
  user.userConfirmationToken = undefined;
  user.userConfirmationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });
});

export const sendOtp = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError("Password and email are required", 401));
  }

  const user = await User.findOne({ email }).select("+password").exec();

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect password or email", 401));
  }

  const otp = await user.generateAndSaveOtp(); // TODO: SEND OTP VIA EMAIL

  res.status(200).send({
    statusText: "success",
    message: "OTP is sent to your email",
    otp: isProduction ? undefined : otp,
  });
});

export const signIn = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("Otp is required", 400));
  }

  const hashedOtp = createHash(otp);

  const user = await User.findOne({
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(new AppError("OTP is incorrect or expired", 401));
  }

  user.otpExpires = undefined;
  user.otp = undefined;
  user.save({ validateBeforeSave: false });
  await generateAndSendJwtCookie(user, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).exec();

  if (!user) {
    return next(new AppError("User with this email does not exits", 404));
  }
  const token = await user.generateAndSavePasswordResetToken();
});
export const resetPassword = catchAsync(async (req, res, next) => {});

export const protect = catchAsync(async (req, res, next) => {
  const { authorization } = req;
  let token;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Log in to get access", 401),
    );
  }

  const decoded = await verify(token);
  const user = await User.findById(decoded.id).exec();

  if (!user) {
    return next(
      new AppError("The user associated with this account no longer exits"),
      401,
    );
  }

  if (user.passwordChangedAfterJwt) {
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
