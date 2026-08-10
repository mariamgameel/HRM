const LeaveRequest = require("../models/LeaveRequest.model");
const User = require("../models/User.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const paginate = require("../utils/paginate");
const {
    createLeaveSchema,
    updateLeaveStatusSchema
} = require("../validators/LeaveRequestVaidator");

// Calculate number of days between two dates
const calculateDays = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};


const createLeave = catchAsync(async (req, res, next) => {
    const { leaveType, startDate, endDate, reason } = req.body;
    const totalDays = calculateDays(startDate, endDate);
    const leave = await LeaveRequest.create({
        employee: req.user.id,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason || "",
    });
    res.status(201).json({ success: true, msg: "Leave request submitted successfully", leave });
});


const getMyLeaves = catchAsync(async (req, res, next) => {
    const leaves = await LeaveRequest.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves });
});


const getAllLeaves = catchAsync(async (req, res, next) => {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const { data: leaves, pagination } = await paginate(
        LeaveRequest,
        query,
        req.query,
        {
            populate: [
                { path: "employee", select: "name email department position" },
                { path: "reviewedBy", select: "name" },
            ],
            sort: { createdAt: -1 },
        }
    );
    res.status(200).json({ success: true, leaves, pagination });
});


const getLeaveById = catchAsync(async (req, res, next) => {
    const leave = await LeaveRequest.findById(req.params.id)
    .populate("employee", "name email department")
    .populate("reviewedBy", "name");
    if (!leave) {
        return next(new AppError("Leave request not found", 404));
    }
    //employee can only view their own requests
    if (req.user.role === "employee" && leave.employee._id.toString() !== req.user.id) {
        return next(new AppError("Access denied", 403))
    }
    res.status(200).json({ success: true, leave });
});

const updateLeaveStatus = catchAsync(async (req, res, next) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
        return next(new AppError("Leave request not found", 404));
    }
    if (leave.status !== "pending") {
        return next(new AppError(`This request has already been ${leave.status}`, 400));
    }
    leave.status = req.body.status;
    leave.reviewedBy = req.user.id;
    leave.reviewNote = req.body.reviewNote || "";
    await leave.save();
    res.status(200).json({
        success: true,
        msg: `Leave request ${req.body.status} successfully`,
        leave
    });
});

const deleteLeave = catchAsync(async (req, res, next) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
        return next(new AppError("Leave request not found", 404));
    }
    // only the employee who created it can delete it
    if (leave.employee.toString() !== req.user.id) {
        return next(new AppError("Access denied", 403));
    }
    // can't delete if already reviewed
    if (leave.status !== "pending") {
        return next(new AppError("cannot delete a request that has already been reviewed", 400));
    }
    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, msg: "Leave request deleted successfully" });
});

module.exports = {
    createLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    updateLeaveStatus,
    deleteLeave
};