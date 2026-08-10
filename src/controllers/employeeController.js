const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const calculateSalary = require("../utils/calculateSalary");
const paginate = require("../utils/paginate");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { ROLES } = require("../constants");
const {
    createEmployeeSchema,
    updateEmployeeSchema,
    updateStatusSchema,
} = require("../validators/employeeValidator");


const getAllEmployees = catchAsync(async (req, res, next) => {
    const { data: employees, pagination } = await paginate(
        User,
        { role: "employee" },
        req.query,
        { select: "-password", sort: { createdAt: -1 } }
    );
    res.status(200).json({ success: true, employees, pagination });
});


const getEmployeeById = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    res.status(200).json({ success: true, employee });
});


const createEmployee = catchAsync(async (req, res, next) => {
    const { name, email, phone, department, position, salary, hireDate } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("An account with this email already exists", 400));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Employee@123", salt);
    const employee = await User.create({
        name, 
        email,
        phone,
        department,
        position,
        salary: salary || 0,
        hireDate: hireDate || Date.now(),
        password: hashedPassword,
        role: "employee",
        status: "active",
    });
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    res.status(201).json({ success: true, msg: "Employee created successfully", employee: employeeResponse });
});


const updateEmployee = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    const updatedEmployee = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        ).select("-password");
        res.status(200).json({ success: true, msg: "Employee updated successfully", employee: updatedEmployee });
});


const updateEmployeeStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    employee.status = status;
    await employee.save();
    res.status(200).json({ success: true, msg: `Employee status updated to "${status}"`, employee });
});


const getEmployeeSalary = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id).select("name salary role");
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    const bonus = parseFloat(req.query.bonus) || 0;
    const deductions = parseFloat(req.query.deductions) || 0;
    const netSalary = calculateSalary(employee.salary, bonus, deductions);
    res.status(200).json({
        success: true,
        employee: employee.name,
        baseSalary: employee.salary,
        bonus,
        deductions,
        netSalary,
    });
});


const uploadEmployeeDocs = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new AppError("No files were uploaded", 400));
    }
    if (req.files.profilePicture) {
        employee.profileImage = req.files.profilePicture[0].path;
    }
    if (req.files.cv) {
        employee.cv = req.files.cv[0].path;
    }
    await employee.save();
    res.status(200).json({
        success: true,
        msg: "Documents uploaded successfully",
        profilePicture: req.files.profilePicture?.[0].path || null,
        cv: req.files.cv?.[0].path || null,
    });
});


const deleteEmployee = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
        return next(new AppError("Employee not found", 404));
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, msg: "Employee deleted successfully" });
});


module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    updateEmployeeStatus,
    getEmployeeSalary,
    uploadEmployeeDocs,
    deleteEmployee,
};