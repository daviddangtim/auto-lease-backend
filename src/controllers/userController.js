import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js"


export const updateMyPassword = catchAsync(async (req, res, next) => {
    const { password } = req.body;
    const date = new Date()
    const user = await User.findById(req.user._id)

    if (!user) {
        return res.status(404).json({ message: "Internal Server Error" })
    }

    await Promise.all(() => {
        user.passwordChangedAt = date.now();
        user.password = password;
    }
    )

    await user.save()

    res.status(200).json({ message: "Password Updated Successfully" })
});

export const updateProfilePhoto = catchAsync(async (req, res, next) => { });

export const updateMe = catchAsync(async (req, res, next) => {
    const updates = {}

    if (req.body.name) {
        updates.name = req.body.name
    }

    if (req.body.email) {
        updates.email = req.body.email
    }

    const user = findByIdAndUpdate(req.user._id, { $set: { updates } })
    if (user.nModified === 0) {
        return res.status(404).json({ message: "Unable to update fields because they were not found" })
    }

    res.status(200).json({ message: "Details Updated Successfully" })
    await user.save();
});

export const deleteMe = catchAsync(async (req, res, next) => { 

    
});
