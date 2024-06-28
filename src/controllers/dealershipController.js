import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import { catchAsync, filterObject, isProduction } from "../utils/utils.js";
import Dealership from "../models/dealershipModel.js";
import { ROLES } from "../utils/constants.js";

const { ADMIN, DEALER } = ROLES;

export const createDealership = (action) =>
  catchAsync(async (req, res, next) => {
    const id =
      action === ADMIN
        ? req.params?.id
        : req.user?._id || "667b6a878941451af60400da"; //temporal;

    if (await Dealership.findById(id, {}, { lean: true }).exec()) {
      return next(new AppError("Dealership with this ID already exists", 409));
    }

    const payload = filterObject(
      req.body,
      isProduction
        ? ["isApproved", "slug", "ratingsAverage", "ratingsQuantity"]
        : [""],
      {
        exclude: true,
      },
    );

    payload.owner = id;

    const dealership = await Dealership.create(payload);

    res.status(202).json({
      statusText: "success",
      data: { dealership },
    });
  });

export const getDealership = (exposeSensitiveFields = false) =>
  catchAsync(async (req, res, next) => {
    let dealership;

    if (exposeSensitiveFields) {
      dealership = await Dealership.findById(req.params.id, {}, { lean: true })
        .select("+cacCertificate +isApproved +dealershipLicence")
        .exec();
    } else {
      dealership = await Dealership.findById(
        req.params.id,
        {},
        { lean: true },
      ).exec();
    }

    if (!dealership) {
      return next(new AppError("Dealership not found", 404));
    }

    res.status(200).json({
      statusText: "success",
      data: { dealership },
    });
  });

export const getDealerships = catchAsync(async (req, res, next) => {
  let payload = [];
  const appQueries = new AppQueries(
    req.query,
    Dealership.find({}, {}, { lean: true }),
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const dealerships = await appQueries.query;

  // Filter out sensitive fields for non-admin users to avoid creating multiple routes.
  // This ensures only admins see certain field.
  // Using a 'for' loop for performance considerations.
  if (req?.user?.role !== ADMIN) {
    const len = dealerships.length;
    for (let i = 0; i < len; i++) {
      payload.push(
        filterObject(dealerships[i], ["cacCertificate", "dealershipLicence"], {
          exclude: true,
        }),
      );
    }
  } else {
    payload = dealerships;
  }

  res.status(200).json({
    statusText: "success",
    numResult: payload.length,
    data: { dealerships: payload },
  });
});

export const updateMyDealership = catchAsync(async (req, res, next) => {});
export const deleteMyDealership = catchAsync(async (req, res, next) => {});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DEALERSHIP ADMIN CONTROLLERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateDealership = catchAsync(async (req, res, next) => {});
export const deleteDealership = catchAsync(async (req, res, next) => {});
