import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import Email from "../utils/email.js";
import Dealership from "../models/dealershipModel.js";
import User from "../models/userModel.js";
import { ROLES } from "../utils/constants.js";
import { filterObject, isProduction } from "../utils/helpers.js";
import { comparePassword } from "../utils/userHelper.js";

const { ADMIN, DEALER, USER } = ROLES;

export const createDealership = async (reqBody, userId, options = {}) => {
  const { createdByAdmin } = options;
  let user;

  if (createdByAdmin) {
    user = await User.findById(userId).exec();

    if (!user) {
      throw new AppError("No user found with this ID", 404);
    }

    if (!user.isVerified) {
      throw new AppError("User is not verified", 403);
    }

    if (user.role === DEALER) {
      throw new AppError("User is already a dealer", 409);
    }

    if (user.role === ADMIN) {
      throw new AppError("Admins cannot have a dealership", 403);
    }
  } else {
    user = options.currentUser;
  }

  if (await Dealership.exists({ owner: user._id }).exec()) {
    throw new AppError("Dealership with this user already exists", 409);
  }

  const payload = filterObject(
    reqBody,
    isProduction
      ? [
          "slug",
          "isApproved",
          "owner",
          "ratingsAverage",
          "ratingsQuantity",
          "dealershipLicence",
          "cacCertificate",
        ]
      : [""],
    { exclude: true },
  );

  payload.owner = userId;
  payload.isApproved = createdByAdmin || false;

  const dealership = await Dealership.create(payload);

  if (createdByAdmin) {
    try {
      user.role = DEALER;
      user.applicationStatus = undefined; // in case this user has applied
      await new Email(user, { createdByAdmin: true }).sendApprovedDealership();
    } catch (err) {
      user.role = USER;
      await user.save({ validateBeforeSave: false });

      await Dealership.findOneAndDelete({ owner: user.id }, { lean: true })
        .setOptions({ bypass: true })
        .exec();

      throw new AppError(
        "Failed to send email. Dealership creation has been reverted.",
        500,
      );
    }
  }

  return { dealership, user };
};

export const getDealership = async (dealershipId, options = {}) => {
  const { secured } = options;
  let dealership;

  if (secured) {
    dealership = await Dealership.findById(dealershipId, {}, { lean: true })
      .select("+dealershipLicence +cacCertificate +isApproved")
      .exec();
  } else {
    dealership = await Dealership.findById(
      dealershipId,
      {},
      { lean: true },
    ).exec();
  }

  if (!dealership) {
    throw new AppError("Dealership not found", 404);
  }

  return { dealership };
};

export const getAllDealerships = async (isAdmin, query) => {
  let appQueries;

  if (isAdmin) {
    appQueries = new AppQueries(query, Dealership.find({}))
      .filter()
      .sort()
      .limitFields()
      .paginate();
  } else {
    appQueries = new AppQueries(query, Dealership.find({}, {}, { lean: true }))
      .filter()
      .sort()
      .paginate();
  }

  const dealerships = await appQueries.query
    .setOptions({ bypass: false })
    .exec();

  return { dealerships };
};

export const updateDealership = async (reqBody, userId) => {
  const payload = filterObject(
    reqBody,
    ["slug", "isApproved", "owner", "dealershipLicence", "cacCertificate"],
    { exclude: true },
  );

  const updatedDealership = await Dealership.findByIdAndUpdate(
    userId,
    payload,
    {
      includeResultMetadata: true,
      new: true,
      lean: true,
    },
  ).exec();

  if (!updatedDealership) {
    throw new AppError("No dealership associated with this user", 404);
  }

  return { updatedDealership };
};

export const updateDealershipCerts = async (reqBody, user) => {
  const payload = filterObject(reqBody, [
    "cacCertificate",
    "dealershipLicence",
    "password",
  ]);

  if (!payload.password) {
    throw new AppError("Password is required to carry out this operation", 403);
  }

  if (!(await comparePassword(payload.password, user.password))) {
    throw new AppError("Password is incorrect", 403);
  }

  const updatedDealership = await Dealership.findOneAndUpdate(
    { owner: user.id },
    payload,
    { new: true, lean: true, includeResultMetadata: true },
  ).exec();

  return { updatedDealership };
};
