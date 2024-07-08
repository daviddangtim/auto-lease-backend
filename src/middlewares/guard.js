import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/helpers.js";
import { verify } from "../utils/jwt.js";
import { passwordChangedAfterJwt } from "../utils/userHelper.js";
import User from "../models/userModel.js";

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

  const decoded = await verify(token);
  const user = await User.findById(decoded.id)
    .select("+passwordChangedAt +isVerified +applicationStatus")
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
        "You recently changed your password. Please log in again.",
        401,
      ),
    );
  }

  req.user = user;

  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    const user = req.user;
    if (!user.isVerified) {
      return next(
        new AppError(
          "Your account needs to be verified to access this resource.",
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
