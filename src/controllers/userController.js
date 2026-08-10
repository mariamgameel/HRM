const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const paginate = require("../utils/paginate");
const { updateUserSchema } = require ("../validators/userValidator");

const getAllUsers = catchAsync(async (req, res, next) => {
    const { data: users, pagination } = await paginate(
        User,
        {},
        req.query,
        { select: "-password", sort: { createdAt: -1 } }
    );
    res.status(200).json({ success: true, users, pagination });
});


const getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, user });
});


const updateUser = catchAsync(async (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return next(new AppError(error.details.map(d => d.message).join(", "), 400));
    }
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
    }).select("-password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, msg: "User updated successfully", user });
});


const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ msg: "User deleted successfully" });
});


module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};