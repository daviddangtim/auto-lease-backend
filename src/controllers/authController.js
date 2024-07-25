import * as authService from "../services/authService.js";
import { catchAsync } from "../utils/helpers.js";
import generateAndSendJwtCookie from "../utils/generateAndSendJwtCookie.js";

export const signUp = catchAsync(async (req, res) => {
  const { message, user } = await authService.signUp(req);
  await generateAndSendJwtCookie(res, user, 201, message);
});

export const requestConfirmationToken = catchAsync(async (req, res) => {
  console.log("came here")
  const { message } = await authService.requestVerification(req);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const verifyUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { message } = await authService.verifyUser(token);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const signIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  const { message} = await authService.signIn(password, email,res);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const signIn2fa = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  const { user } = await authService.signIn2fa(otp);
  await generateAndSendJwtCookie(res, user, 200);
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { message } = await authService.forgotPassword(email);

  res.status(200).json({
    statusText: "success",
    message,
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const { message } = await authService.resetPassword(
    token,
    password,
    passwordConfirm,
  );

  res.status(200).json({
    statusText: "success",
    message,
  });
});
