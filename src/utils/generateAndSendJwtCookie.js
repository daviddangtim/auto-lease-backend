import { sign } from "./jwt.js";
import { createTimeStampInEpoch } from "./utils.js";

const generateAndSendJwtCookie = async (
  user,
  res,
  message = undefined,
  statusCode = 200,
) => {
  const token = await sign(user._id);
  user.password = undefined;
  user.userConfirmationToken = undefined;
  user.userConfirmationTokenExpires = undefined;
  const expires = new Date(
    createTimeStampInEpoch(JSON.parse(process.env.JWT_COOKIE_EXPIRES_IN)),
  );

  res.cookie("jwt", token, {
    expires,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(statusCode).json({
    token: token,
    statusText: "success",
    message,
    data: { user },
  });
};

export default generateAndSendJwtCookie;
