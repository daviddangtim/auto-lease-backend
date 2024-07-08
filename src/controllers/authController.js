import AppError from "../utils/appError.js";
import * as authService from "../services/authService.js";
import { catchAsync } from "../utils/helpers.js";
import generateAndSendJwtCookie from "../utils/generateAndSendJwtCookie.js";

export const signUp = catchAsync(async (req, res) => {
  const result = await authService.signUp(req);

  res.status(201).json({
    statusText: "success",
    message: result.message,
  });
});

export const requestConfirmationToken = catchAsync(async (req, res) => {
  const result = await authService.requestVerification(req);

  res.status(200).json({
    statusText: "success",
    message: result.message,
    token: result.token, // This will only be visible in dev mode
  });
});

export const verifyUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const result = await authService.verifyUser(token);

  res.status(200).json({
    statusText: "success",
    message: result.message,
  });
});

export const signIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  const result = await authService.signIn(password, email);

  res.status(200).json({
    statusText: "success",
    message: result.message,
    otp: result.otp,
  });
});

export const signIn2fa = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  const result = await authService.signIn2fa(otp);
  await generateAndSendJwtCookie(result.user, res);
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  res.status(200).json({
    statusText: "success",
    message: result.message,
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const result = await authService.resetPassword(
    token,
    password,
    passwordConfirm,
  );

  res.status(200).json({
    statusText: "success",
    message: result.message,
  });
});
