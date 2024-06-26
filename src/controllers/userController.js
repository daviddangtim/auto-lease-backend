import { catchAsync } from "../utils/utils.js";
import User from "../models/userModel.js"



export const updateMyPassword = catchAsync(async (req, res, next) => {
    const { password } = req.body;

    const user = await User.findById(req.user._id)
    if (!user){
        return res.status(404).json({message : "Internal Server Error"})
    }
    user.password = password;

    await user.save()
    
    res.status(200).json({message:"Password Updated Successfully"})
});
export const updateProfilePhoto = catchAsync(async (req, res, next) => { });
export const updateMe = catchAsync(async (req, res, next) => { });
export const deleteMe = catchAsync(async (req, res, next) => { });
