import { catchAsync } from "../utils/helpers.js";
import {
  cloudinaryImageUpdater,
  cloudinaryImageUploader,
} from "../utils/imageUploader.js";
import AppError from "../utils/appError.js";

export const setCreateCoverImage = catchAsync(async (req, res, next) => {
  const [coverImage] = req.files?.coverImage;
  if (!coverImage) {
    return next(new AppError("Cover image is required", 400));
  }

  const result = await cloudinaryImageUploader(coverImage.buffer);

  req.body.coverImage = {
    url: result.secure_url,
    id: result.public_id,
  };

  console.log({
    url: result.secure_url,
    id: result.public_id,
  });
  next();
});

export const setUpdateCoverImage = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id, { coverImage: 1 })
      .lean()
      .exec();

    if (doc) {
      const result = await cloudinaryImageUpdater(
        req.file.buffer,
        doc.coverImage.id,
      );

      req.body.coverImage = {
        url: result.secure_url,
        id: result.public_id,
      };
    }

    next();
  });
