import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import {cloudinary} from "../utils/imageUploader.js";
import {defaultProfilePic} from "../utils/constants.js";

export const updateMyPassword = catchAsync(async (req, res, next) => {
	const { currentPassword, password, passwordConfirm } = req.body;
	const { user } = req;

	if (!(await user.comparePassword(currentPassword, user.password))) {
		return next(new AppError("Current password is incorrect", 400));
	}
	user.password = password;
	user.passwordConfirm = passwordConfirm;

	await user.save();

	res
		.status(200)
		.json({ message: "Password Updated Successfully", data: { user } });
});


export const updateProfilePhoto = catchAsync(async (req, res, next) => {
	const image = req.file.path;
	const {user} = req

	await cloudinary.uploader.destroy(user.profilePhotoId)
	await cloudinary.uploader.upload(image)

	if (!image){
		user.profilePhoto = defaultProfilePic;
		user.profilePhotoId = null;
	}

	user.profilePhoto = image.secure_url;
	user.profilePhotoId = image.public_id;

	await user.save();
	res.status(200).json({status:"Successful", data:user.profilePhoto})

});

export const updateMe = catchAsync(async (req, res, next) => {
	const updates = {};

	if (req.body.name) {
		updates.name = req.body.name;
	}
	if (req.body.email) {
		updates.email = req.body.email;
	}

	const user = findByIdAndUpdate(req.user._id, { $set: { updates } });
	if (user.nModified === 0) {
		return next(new AppError("Unable to update fields", 400))
	}

	await user.save();
	res.status(200).json({ message: "Details Updated Successfully" });
});

export const deleteMe = catchAsync(async (req, res, next) => {
	const user = findByIdAndDelete(req.user._id);
	if (!user){
		return next(new AppError("User Not found", 404))
	}
	await user.save();
	res.status(200).json({ message: "User deleted " });
});
