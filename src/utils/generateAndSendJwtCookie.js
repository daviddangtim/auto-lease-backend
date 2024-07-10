import { sign } from "./jwt.js";
import { createTimeStampInEpoch } from "./helpers.js";
import { destroySensitiveData } from "./userHelper.js";

const generateAndSendJwtCookie = async (res, user, statusCode = 200, msg) => {
  const token = await sign(user.id);
  const expires = new Date(
    createTimeStampInEpoch(JSON.parse(process.env.JWT_COOKIE_EXPIRES_IN)),
  );

  res.cookie("jwt", token, {
    expires,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  destroySensitiveData(user);

  res.status(statusCode).json({
    token: token,
    statusText: "success",
    message: msg,
    data: { user },
  });
};

export default generateAndSendJwtCookie;
