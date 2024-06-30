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
import {
  comparePassword,
  confirmUserAndSave,
  destroyOtpAndSave,
  destroyPasswordResetTokenAndSave,
  generateAndSaveOtp,
  generateAndSavePasswordResetToken,
  passwordChangedAfterJwt,
} from "../utils/userHelper.js";

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
    return next(
      new AppError("Email is required to request a confirmation token.", 400),
    );
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(
      new AppError("No user found with the provided email address.", 404),
    );
  }

  if (user.isUserConfirmed) {
    return next(new AppError("This user is already confirmed.", 409));
  }

  await sendConfirmationToken(req, res, next, user);
});

export const confirmUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Confirmation token is required.", 400));
  }

  const user = await User.findOne({
    userConfirmationToken: createHash(token),
    userConfirmationTokenExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(
      new AppError(
        "The token provided is either incorrect or has expired.",
        401,
      ),
    );
  }

  await confirmUserAndSave(user);
  await new Email(user, `${baseUrl(req)}/api/v1/user/me`).sendWelcome();
  await generateAndSendJwtCookie(user, res);
});

export const signIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError("Both password and email are required.", 401));
  }

  const user = await User.findOne({ email }).select("+password").exec();

  if (!user || !(await comparePassword(password, user.password))) {
    return next(new AppError("Incorrect password or email.", 401));
  }

  // TODO: remove the second condition when done
  if (!user.isUserConfirmed && isProduction) {
    return await sendConfirmationToken(req, res, next, user, 401);
  }

  try {
    const otp = await generateAndSaveOtp(user);
    await new Email(user, otp).sendOtp();

    res.status(200).send({
      statusText: "success",
      message: "An OTP has been sent to your email.",
      otp: isProduction ? undefined : otp, // TODO: remove this when done
    });
  } catch (err) {
    await destroyOtpAndSave(user);
    return next(
      new AppError(
        "There was an error sending the OTP. Please try again.",
        500,
      ),
    );
  }
});

export const verify = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("OTP is required to verify your login.", 400));
  }

  const user = await User.findOne({
    otp: createHash(otp),
    otpExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(
      new AppError("The OTP provided is either incorrect or has expired.", 401),
    );
  }

  await destroyOtpAndSave(user);
  await generateAndSendJwtCookie(user, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required to reset password.", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(
      new AppError("No user found with the provided email address.", 404),
    );
  }

  const token = await generateAndSavePasswordResetToken(user);
  const url = `${baseUrl(req)}/auth/reset-password/${token}`;

  try {
    await new Email(user, url).sendPasswordReset();
    res.status(200).send({
      statusText: "success",
      message: `Please check the email address ${email} for instructions to reset your password.`,
    });
  } catch (err) {
    await destroyPasswordResetTokenAndSave(user);
    return next(
      new AppError("There was an error sending the password reset email.", 500),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Reset token is required.", 400));
  }

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        "Both password and password confirmation are required.",
        401,
      ),
    );
  }

  const user = await User.findOne({
    passwordResetToken: createHash(token),
    passwordResetTokenExpires: { $gt: Date.now() },
  })
    .select("+password")
    .exec();

  if (!user) {
    return next(
      new AppError(
        "The reset token provided is either incorrect or has expired.",
        401,
      ),
    );
  }

  if (await comparePassword(password, user.password)) {
    return next(
      new AppError(
        "The new password cannot be the same as the old password.",
        400,
      ),
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await destroyPasswordResetTokenAndSave(user);

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
      new AppError("You are not logged in. Please log in to get access.", 401),
    );
  }

  const decoded = await jwtVerify(token);
  const user = await User.findById(decoded.id, {}, { lean: true })
    .select("+passwordChangedAt")
    .exec();

  if (!user) {
    return next(
      new AppError(
        "The user associated with this account no longer exists.",
        401,
      ),
    );
  }

  if (passwordChangedAfterJwt(decoded.iat, user.passwordChangedAt)) {
    return next(
      new AppError(
        "User recently changed their password. Please log in again.",
        401,
      ),
    );
  }

  user.passwordChangedAt = undefined;
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
          "Your account needs to be confirmed to access this resource.",
          403,
        ),
      );
    }

    if (!roles.includes(user.role)) {
      return next(
        new AppError("You are not authorized to access this resource.", 403),
      );
    }
    return next();
  };
