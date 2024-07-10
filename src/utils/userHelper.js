import bcrypt from "bcrypt";
import {
  createHash,
  createRandomBytes,
  createTimeStampInEpoch,
} from "./helpers.js";

export const passwordChangedAfterJwt = function (jwtIat, passwordChangedAt) {
  if (passwordChangedAt) {
    return passwordChangedAt.getTime() / 1000 > jwtIat;
  }
  return false;
};

export const comparePassword = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

export const destroyOtpAndSave = async (user) => {
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

export const destroyPasswordReset = async (user) => {
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
};

export const generateAndSaveVerificationToken = async (user) => {
  const token = await createRandomBytes(32);
  user.verificationToken = createHash(token);
  user.verificationTokenExpires = createTimeStampInEpoch({ m: 10 });
  await user.save({ validateBeforeSave: false });
  return token;
};

export const destroyVerificationTokenAndSave = async (user) => {
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.save({ validateBeforeSave: false });
};

export const destroySensitiveData = (user) => {
  user.password = undefined;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.isActive = undefined;
};
