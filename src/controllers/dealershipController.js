import * as service from "../services/dealershipService.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/helpers.js";
import { ROLES } from "../utils/constants.js";
import Dealership from "../models/dealershipModel.js";

const { ADMIN, DEALER, USER } = ROLES;

export const createDealership = catchAsync(async (req, res) => {
  const { dealership, user } = await service.createDealership(
    req.body,
    req.params.id,
    {
      createdByAdmin: true,
    },
  );

  res.status(201).json({
    statusText: "success",
    data: { user, dealership },
  });
});

export const updateDealershipCerts = catchAsync(async (req, res) => {
  const { updatedDealership } = await service.updateDealershipCerts(
    req.body,
    req.user,
  );

  res.status(200).json({
    statusText: "success",
    data: { updatedDealership },
  });
});

export const getDealership = catchAsync(async(req,res,next)=>{
  const {dealership} = await Dealership.findOne({owner:req.params.id}).select("+isApproved").exec()
  res.status(200).json({
    statusText: "success",
    data: {dealership}
  })
});

export const getAllDealershipsv1 = catchAsync(async (req, res, next) => {});

export const getAllDealerships = factory.getAll(service.getAllDealerships);

export const updateDealership = factory.updateById(service.updateDealership);

export const deleteDealership = factory.deleteById(service.deleteDealership);

export const deleteMyDealership = catchAsync(async (req, res, next) => {});
