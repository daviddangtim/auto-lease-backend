import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

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

export const updateMyPasswordV1 = catchAsync(async (req, res, next) => {
	// GET THE CURRENT USER FROM THE REQUEST OBJECT PASSED BY PROTECT
	const { user } = req;
	const { currentPassword, password, passwordConfirm } = req.body;

	// COMPARE THE PASSWORDS
	if (!(await user.comparePassword(currentPassword, user.password))) {
		return next(new AppError("Current password is incorrect", 401));
	}

	// UPDATE THE PASSWORD
	user.password = password;
	user.passwordConfirm = passwordConfirm;
	await user.save(); // IF VALIDATION FAILS OUR GLOBAL HANDLING MIDDLEWARE WILL TAKE OVER

	res.status(200).json({
		statusText: "success",
		data: { user },
	});
});

export const updateProfilePhoto = catchAsync(async (req, res, next) => {});

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
		return res
			.status(404)
			.json({ message: "Unable to update fields because they were not found" });
	}

	await user.save();
	res.status(200).json({ message: "Details Updated Successfully" });
});

export const deleteMe = catchAsync(async (req, res, next) => {
	const user = findByIdAndDelete(req.user._id);

	await user.save();

	res.status(200).json({ message: "User deleted " });
});
