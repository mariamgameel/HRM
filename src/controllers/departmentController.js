const Department = require("../models/Department.model");
const User = require("../models/User.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
    createDepartmentSchema,
    updateDepartmentSchema,
} = require("../validators/departmentValidator");


const getAllDepartments = catchAsync(async (req, res, next) => {
    const departments = await Department.find();
    res.status(200).json({ success: true, count: departments.length, departments });
});


const getDepartmentById = catchAsync(async (req, res, next) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
        return next(new AppError("Department not found", 404));
    }
    const employeeCount = await User.countDocuments({
        department: department.name,
        role: "employee",
        status: "active",
    });
    res.status(200).json({ success: true, department, employeeCount });
});


const createDepartment = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    const existing = await Department.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
        return next(new AppError("A department with this name already exists", 400));
    }
    const department = await Department.create({ name, description });
    res.status(201).json({ success: true, msg: "Department created successfully", department });
});


const updateDepartment = catchAsync(async (req, res, next) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
        return next(new AppError("Department not found", 404));
    }
    if (req.body.name) {
        const duplicate = await Department.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
            _id: { $ne: req.params.id },
        });
        if (duplicate) {
            return next(new AppError("A department with this name already exists", 400));
        }
    }
    const updated = await Department.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.status(200).json({ success: true, msg: "Department updated successfully", department: updated });
});


const deleteDepartment = catchAsync(async (req, res, next) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
        return next(new AppError("Department not found", 404));
    }
    const employeeCount = await User.countDocuments({
        department: department.name,
        role: "employee",
        status: "active",
    });
    if (employeeCount > 0) {
        return next(new AppError(
            `Cannot delete department - ${employeeCount} active employee(s) still assigned to it. Reassign them first.`,
            400
        ));
    }
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, msg: "Department deleted successfully" });
});


const getDepartmentEmployees = catchAsync(async (req, res, next) => {
    const department  = await Department.findById(req.params.id);
    if (!department) {
        return next(new AppError("Department not found", 404));
    }
    const employees = await User.find({
        department: department.name,
        role: "employee"
    }).select("-password");
    res.status(200).json({
        success: true,
        department: department.name,
        count: employees.length,
        employees,
    });
});


module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentEmployees
};