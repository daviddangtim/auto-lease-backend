import { isProduction } from "./utils.js";

const sendToken = (res, token, name, url) => {
  res.status(200).json({
    statusText: "success",
    message: `${isProduction ? `${name}token is sent to your email` : token}`,
  });
};

export default sendToken;
