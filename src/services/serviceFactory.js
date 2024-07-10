import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import User from "../models/userModel.js";
import { parseMongoQuery } from "../utils/helpers.js";
import { ROLES } from "../utils/constants.js";

const errMsg = (Model) => {
  throw new AppError(
    `No ${Model.modelName.toLocaleLowerCase()} found with this ID`,
    404,
  );
};

export const deleteById = async (Model, id, cb) => {
  const doc = await User.findByIdAndDelete(id, {
    lean: true,
  }).exec();

  if (!doc) errMsg(Model);

  return { key: Model.modelName.toLocaleLowerCase(), value: doc };
};

export const updateById = async (Model, id, update) => {
  const doc = await Model.findByIdAndUpdate(id, update, {
    lean: true,
    runValidators: true,
    new: true,
  }).exec();

  if (!doc) errMsg(Model);

  return { key: Model.modelName, value: doc };
};

export const createOne = async (Model, data) => {
  const doc = await Model.create(data);

  return { key: Model.modelName, value: doc };
};

export const getOneById = async (Model, id, options = {}, cb = (q) => q) => {
  const query = cb(Model.findById(id));
  const doc = await query.exec();

  if (!doc) errMsg(Model);

  return { key: Model.modelName.toLocaleLowerCase(), value: doc };
};

export const getMany = async (Model, queryObj, options = {}, cb = (q) => q) => {
  let query;

  if (options.sensitive) {
    query = new AppQueries(queryObj, Model.find())
      .filter()
      .sort()
      .limitFields()
      .paginate();
  } else {
    query = new AppQueries(queryObj, Model.find()).filter().sort().paginate();
  }

  const docs = await cb(query.query).exec();

  return { key: Model.modelName.toLocaleLowerCase() + "s", value: docs };
};

export const deleteMany = async (Model, filter = {}) => {
  filter.role = { ne: ROLES.ADMIN };
  const result = await Model.deleteMany(parseMongoQuery(filter));

  if (!result.acknowledged) {
    throw new AppError(
      `Failed to delete ${Model.modelName.toLocaleLowerCase()}s.`,
    );
  }

  return { key: Model.modelName.toLocaleLowerCase(), value: result };
};
