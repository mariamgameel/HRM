const User = require("../models/User.model");
const Department = require("../models/Department.model");
const Attendance = require("../models/Attendance.model");
const LeaveRequest = require("../models/LeaveRequest.model");
const catchAsync = require("../utils/catchAsync");
const { ACTIVE_STATUS, ATTENDANCE_STATUS, LEAVE_STATUS } = require("../constants");

// GET /api/dashboard/stats
const getDashboardStats = catchAsync(async (req, res, next) => {
    // 1. Employee Counts
    const totalEmployees = await User.countDocuments();
    const activeEmployees = await User.countDocuments({ status: ACTIVE_STATUS.ACTIVE });
    const inactiveEmployees = totalEmployees - activeEmployees;

    // 2. Department Breakdown
    const departmentBreakdown = await User.aggregate([
        { $match: { status: ACTIVE_STATUS.ACTIVE } },
        {
            $group: {
                _id: { $ifNull: ["$department", "Unassigned"] },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    const totalDepartments = await Department.countDocuments({ status: "active" });

    // 3. Today's Attendance Metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAttendanceRecords = await Attendance.find({
        date: { $gte: startOfToday, $lte: endOfToday }
    }).populate("employee", "name department position profileImage");

    const presentCount = todayAttendanceRecords.filter(r => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const lateCount = todayAttendanceRecords.filter(r => r.status === ATTENDANCE_STATUS.LATE).length;
    const onLeaveAttendance = todayAttendanceRecords.filter(r => r.status === ATTENDANCE_STATUS.ON_LEAVE).length;

    // 4. Pending Leave Requests
    const pendingLeavesCount = await LeaveRequest.countDocuments({ status: LEAVE_STATUS.PENDING });
    const pendingLeaves = await LeaveRequest.find({ status: LEAVE_STATUS.PENDING })
        .populate("employee", "name email department position profileImage")
        .sort({ createdAt: -1 })
        .limit(6);

    // 5. Who's Out Today (Approved leaves covering today)
    const whosOutToday = await LeaveRequest.find({
        status: LEAVE_STATUS.APPROVED,
        startDate: { $lte: endOfToday },
        endDate: { $gte: startOfToday }
    })
        .populate("employee", "name email department position profileImage")
        .limit(10);

    // 6. Weekly Attendance Trends (Past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyRecords = await Attendance.find({
        date: { $gte: sevenDaysAgo, $lte: endOfToday }
    });

    const weeklyTrendMap = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        weeklyTrendMap[key] = {
            day: key,
            date: d.toISOString().split("T")[0],
            present: 0,
            late: 0,
            onLeave: 0
        };
    }

    weeklyRecords.forEach(rec => {
        const dKey = new Date(rec.date).toLocaleDateString("en-US", { weekday: "short" });
        if (weeklyTrendMap[dKey]) {
            if (rec.status === ATTENDANCE_STATUS.PRESENT) weeklyTrendMap[dKey].present += 1;
            else if (rec.status === ATTENDANCE_STATUS.LATE) weeklyTrendMap[dKey].late += 1;
            else if (rec.status === ATTENDANCE_STATUS.ON_LEAVE) weeklyTrendMap[dKey].onLeave += 1;
        }
    });

    const weeklyTrends = Object.values(weeklyTrendMap);

    // Attendance rate
    const totalClockedIn = presentCount + lateCount;
    const attendanceRate = activeEmployees > 0 
        ? Math.min(100, Math.round((totalClockedIn / activeEmployees) * 100))
        : 0;

    res.status(200).json({
        success: true,
        stats: {
            employees: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees,
                departmentsCount: totalDepartments || departmentBreakdown.length,
                departmentBreakdown: departmentBreakdown.map(d => ({
                    name: d._id || "General",
                    count: d.count
                }))
            },
            attendanceToday: {
                present: presentCount,
                late: lateCount,
                onLeave: onLeaveAttendance + whosOutToday.length,
                attendanceRate,
                records: todayAttendanceRecords.slice(0, 5)
            },
            leaves: {
                pendingCount: pendingLeavesCount,
                pendingList: pendingLeaves,
                whosOutToday
            },
            weeklyTrends
        }
    });
});

module.exports = {
    getDashboardStats
};
