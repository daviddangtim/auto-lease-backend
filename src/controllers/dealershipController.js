import * as dealershipService from "../services/dealershipService.js";
import { catchAsync } from "../utils/helpers.js";
import { ROLES } from "../utils/constants.js";

const { ADMIN, DEALER, USER } = ROLES;

export const createDealership = catchAsync(async (req, res) => {
  const { dealership, user } = await dealershipService.createDealership(
    req.params.id,
    req.body,
    {
      createdByAdmin: true,
    },
  );

  res.status(201).json({
    statusText: "success",
    data: { user, dealership },
  });
});

export const getDealership = catchAsync(async (req, res) => {
  const secured = req.user?.role === ADMIN || req.user?.role === DEALER;

  const { dealership } = await dealershipService.getDealership(req.params.id, {
    secured,
  });

  res.status(200).json({
    statusText: "success",
    data: { dealership },
  });
});

export const getAllDealerships = catchAsync(async (req, res) => {
  const isAdmin = req.user?.role === ADMIN;
  const { dealerships } = await dealershipService.getAllDealerships(
    isAdmin,
    req.query,
  );

  res.status(200).json({
    statusText: "success",
    numResult: dealerships.length,
    data: { dealerships },
  });
});

export const updateDealership = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { updatedDealership } = await dealershipService.updateDealership(
    req.body,
    id,
  );

  res.status(200).json({
    statusText: "success",
    data: { updatedDealership },
  });
});

export const updateDealershipCerts = catchAsync(async (req, res) => {
  const { updatedDealership } = await dealershipService.updateDealershipCerts(
    req.body,
    req.user,
  );

  res.status(200).json({
    statusText: "success",
    data: { updatedDealership },
  });
});

export const deleteMyDealership = catchAsync(async (req, res, next) => {});

export const deleteDealership = catchAsync(async (req, res, next) => {});
