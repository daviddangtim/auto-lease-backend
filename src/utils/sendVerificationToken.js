import Email from "./email.js";
import AppError from "./appError.js";
import { isProduction } from "./helpers.js";
import { BASE_URL } from "./constants.js";
import {
  destroyVerificationTokenAndSave,
  generateAndSaveVerificationToken,
} from "./userHelper.js";

const sendVerificationToken = async (user, options = {}) => {
  const token = await generateAndSaveVerificationToken(user);
  const url = `${BASE_URL}/auth/verify/${token}`;

  if (options.notVerified) {
    await new Email(user, { url }).sendVerification();
    throw new AppError(
      "Your account is not verified. Please check your inbox to verify your account.",
      401,
    );
  }

  try {
    await new Email(user, { url }).sendVerification();
    return {
      message:
        "verification email sent! Please check your inbox to verify your account.",
      token: isProduction ? undefined : token,
    };
  } catch (err) {
    await destroyVerificationTokenAndSave(user);

    if (options.create) {
      return {
        message: isProduction
          ? "Your account has been created successfully, but we couldn't send the verification email. Please request a new verification token."
          : `Your account has been created successfully, but there was an error sending the verification email: ${err.message}. Please request a new verification token.`,
      };
    } else {
      throw new AppError(
        isProduction
          ? "An error occurred while sending the verification email. Please try again later."
          : `Error sending verification email: ${err.message}`,
        500,
      );
    }
  }
};

export default sendVerificationToken;
