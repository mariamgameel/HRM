const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("Email already exists", 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        name,
        email, 
        phone,
        password: hashedPassword
    });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, msg: "User registered successfully", user: userResponse });
});


const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new AppError("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError("Invalid credentials", 401));
    }

    const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
    );
    res.status(200).json({ success: true, msg: "Login successful", token });
});


module.exports = {
    registerUser,
    loginUser
};