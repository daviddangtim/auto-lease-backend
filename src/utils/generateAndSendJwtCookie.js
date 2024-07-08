import { sign } from "./jwt.js";
import { createTimeStampInEpoch } from "./helpers.js";

const generateAndSendJwtCookie = async (user, res) => {
  const token = await sign(user.id);
  const expires = new Date(
    createTimeStampInEpoch(JSON.parse(process.env.JWT_COOKIE_EXPIRES_IN)),
  );

  res.cookie("jwt", token, {
    expires,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(200).json({
    token: token,
    statusText: "success",
    data: { user },
  });
};

export default generateAndSendJwtCookie;
