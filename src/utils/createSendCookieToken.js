import {sign} from "./jwt.js";
import {createTimeStampInEpoch} from "./utils.js";

export const createSendCookieToken = async (user, res, statusCode = 200) => {
  const token = await sign(user._id)
  const cookieOptions = {
    expires: new Date(
      createTimeStampInEpoch({ hr: process.env.JWT_COOKIE_EXPIRES_IN }),
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };
  user.password = undefined;
  res
    .status(statusCode)
    .cookie("jwt",token,cookieOptions)
    .json({
      token: token,
      statusText: "success",
      data: { user },
    });
};