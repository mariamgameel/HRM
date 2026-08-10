const Attendance = require("../models/Attendance.model");
const User = require("../models/User.model");
const paginate = require("../utils/paginate");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
    manualAttendanceSchema,
    updateAttendanceSchema,
} = require("../validators/attendanceValidator");


const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const clockIn = catchAsync(async (req, res, next) => {
    const employeeId = req.user.id;
    const now = new Date();
    const today = getStartOfDay(now);

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) {
        return next(new AppError("You have already clocked in today", 400));
    }

    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 0, 0, 0);
    const status = now > lateThreshold ? "late" : "present";

    const attendance = await Attendance.create({
        employee: employeeId,
        date: today,
        clockIn: now,
        status
    });

    res.status(201).json({
        success: true,
        msg: status === "late" ? "Clocked in successfully - marked as late" : "Clocked in successfully",
        attendance
    });
});


const clockOut = catchAsync(async (req, res, next) => {
    const employeeId = req.user.id;
    const now = new Date();
    const today = getStartOfDay(now);

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) {
        return next(new AppError("You have not clocked in today", 400));
    }
    if (attendance.clockOut) {
        return next(new AppError("You have already clocked out today", 400));
    }

    const totalHours = parseFloat(
        ((now - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)
    );

    attendance.clockOut = now;
    attendance.totalHours = totalHours;
    await attendance.save();

    res.status(200).json({
        success: true,
        msg: "Clocked out successfully",
        attendance,
        totalHours: `${totalHours} hours`
    });
});


const getMyAttendance = catchAsync(async (req, res, next) => {
    const records = await Attendance.find({ employee: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: ture, count: records.length, records });
});


const getEmployeeAttendance = catchAsync(async (req, res, next) => {
    const { employeeId } = req.params;
    const employee = await User.findById(employeeId);
    if(!employee || employee.role !== "employee") {
        return next(new AppError("Employee not found", 404));
    }

    const query = { employee: employeeId };
    if (req.query.from || req.query.to) {
        query.date = {};
        if (req.query.from) query.date.$gte = getStartOfDay(req.query.from);
        if (req.query.to) query.date.$lte = getStartOfDay(req.query.to);
    }
    const records = (await Attendance.find(query)).sort({ date: -1 });

    res.status(200).json({
        success: true,
        employee: employee.name,
        count: records.length,
        records
    });
});


const getAllAttendance = catchAsync(async (req, res, next) => {
    const query = {};
    if (req.query.date) {
        query.date = getStartOfDay(req.query.date);
    } else if (req.query.from || req.query.to) {
        query.date = {};
        if (req.query.from) query.date.$gte = getStartOfDay(req.query.from);
        if (req.query.to) query.date.$lte = getStartOfDay(req.query.to);
    }
    const { data, records, pagination } = await paginate(
        Attendance,
        query,
        req.query,
        { populate: { path: "employee", select: "name email department position" }, sort: { date: -1 } }
    );
    res.status(200).json({ success: true, records, pagination });
});


const markManualAttendance = catchAsync(async (req, res, next) => {
    const { employee, date, status, note } = req.body;
    const day = getStartOfDay(date);

    const employeeUser = await User.findById(employee);
    if (!employeeUser || employeeUser.role !== "employee") {
        return next(new AppError("Employee not found", 404));
    }

    const existing = await Attendance.findOne({ employee, date: day });
    if (existing) {
        return next(new AppError("An attendance record already exists for this employee on this date", 400));
    }

    const attendance = await Attendance.create({
        employee,
        date: day,
        status,
        note: note || ""
    });

    res.status(201).json({ success: true, msg: "Attendance marked successfully", attendance });
});


const updateAttendance = catchAsync(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
        return next(new AppError("Attendance record not found", 404));
    }

    Object.assign(attendance, req.body);

    if (attendance.clockIn && attendance.clockOut) {
        attendance.totalHours = parseFloat(
            ((attendance.clockOut - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)
        );
    }
    await attendance.save();

    res.status(200).json({ success: true, msg: "Attendance updated successfully", attendance });
});


const deleteAttendance = catchAsync(async (req, res, next) => {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
        return next(new AppError("Attendance record not found", 404));
    }

    res.status(200).json({ msg: "Attendance record deleted successfully" });
});

module.exports = {
    clockIn,
    clockOut,
    getMyAttendance,
    getEmployeeAttendance,
    getAllAttendance,
    markManualAttendance,
    updateAttendance,
    deleteAttendance
};