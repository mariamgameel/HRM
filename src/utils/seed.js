require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Department = require("../models/Department.model");
const Attendance = require("../models/Attendance.model");
const LeaveRequest = require("../models/LeaveRequest.model");
const { ROLES, ACTIVE_STATUS, ATTENDANCE_STATUS, LEAVE_STATUS, LEAVE_TYPE } = require("../constants");

async function seedDatabase() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrm";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log("Cleared existing database records.");

    // 1. Create Departments
    const deptNames = ["Engineering", "Product Design", "Human Resources", "Sales & Marketing", "Finance"];
    const departments = await Department.insertMany(
        deptNames.map((name) => ({
            name,
            description: `${name} department operations and team members.`,
            status: "active",
        }))
    );
    console.log(`Created ${departments.length} departments.`);

    // 2. Hash default passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("Admin@123", salt);
    const hrPassword = await bcrypt.hash("Hr@12345", salt);
    const empPassword = await bcrypt.hash("Employee@123", salt);

    // 3. Create Users
    const usersToInsert = [
        {
            name: "Alex Carter",
            email: "admin@hrm.com",
            password: adminPassword,
            phone: "+1 555-0101",
            role: ROLES.ADMIN,
            department: "Human Resources",
            position: "Chief Executive Officer",
            salary: 12000,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2023-01-15"),
        },
        {
            name: "Sarah Jenkins",
            email: "hr@hrm.com",
            password: hrPassword,
            phone: "+1 555-0102",
            role: ROLES.HR,
            department: "Human Resources",
            position: "HR Operations Director",
            salary: 7500,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2023-03-01"),
        },
        {
            name: "David Chen",
            email: "david.chen@hrm.com",
            password: empPassword,
            phone: "+1 555-0103",
            role: ROLES.EMPLOYEE,
            department: "Engineering",
            position: "Senior Full Stack Engineer",
            salary: 8500,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2023-06-10"),
        },
        {
            name: "Elena Rostova",
            email: "elena.rostova@hrm.com",
            password: empPassword,
            phone: "+1 555-0104",
            role: ROLES.EMPLOYEE,
            department: "Product Design",
            position: "Lead Product Designer",
            salary: 7800,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2023-08-20"),
        },
        {
            name: "Marcus Vance",
            email: "marcus.vance@hrm.com",
            password: empPassword,
            phone: "+1 555-0105",
            role: ROLES.EMPLOYEE,
            department: "Engineering",
            position: "DevOps & Cloud Architect",
            salary: 9200,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2023-09-01"),
        },
        {
            name: "Sophia Martinez",
            email: "sophia.martinez@hrm.com",
            password: empPassword,
            phone: "+1 555-0106",
            role: ROLES.EMPLOYEE,
            department: "Sales & Marketing",
            position: "Head of Growth & Outreach",
            salary: 6800,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2024-02-14"),
        },
        {
            name: "James Wilson",
            email: "james.wilson@hrm.com",
            password: empPassword,
            phone: "+1 555-0107",
            role: ROLES.EMPLOYEE,
            department: "Finance",
            position: "Financial Analyst",
            salary: 5900,
            status: ACTIVE_STATUS.ACTIVE,
            hireDate: new Date("2024-04-01"),
        },
    ];

    const createdUsers = await User.insertMany(usersToInsert);
    console.log(`Created ${createdUsers.length} users.`);

    // 4. Create Sample Attendance Records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clockInTime = new Date();
    clockInTime.setHours(8, 45, 0, 0);

    const attendanceRecords = [
        {
            employee: createdUsers[0]._id, // Admin
            date: today,
            clockIn: clockInTime,
            status: ATTENDANCE_STATUS.PRESENT,
        },
        {
            employee: createdUsers[1]._id, // HR
            date: today,
            clockIn: clockInTime,
            status: ATTENDANCE_STATUS.PRESENT,
        },
        {
            employee: createdUsers[2]._id, // David
            date: today,
            clockIn: new Date(Date.now() - 4 * 3600 * 1000),
            clockOut: new Date(Date.now()),
            totalHours: 4,
            status: ATTENDANCE_STATUS.PRESENT,
        },
        {
            employee: createdUsers[3]._id, // Elena
            date: today,
            clockIn: new Date(Date.now() - 3 * 3600 * 1000),
            status: ATTENDANCE_STATUS.LATE,
        },
    ];

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records for today.`);

    // 5. Create Sample Leave Requests
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 3);

    const leaveRequests = [
        {
            employee: createdUsers[4]._id, // Marcus Vance
            leaveType: LEAVE_TYPE.ANNUAL,
            startDate: tomorrow,
            endDate: endOfWeek,
            totalDays: 3,
            reason: "Annual family trip planned in advance.",
            status: LEAVE_STATUS.PENDING,
        },
        {
            employee: createdUsers[5]._id, // Sophia Martinez
            leaveType: LEAVE_TYPE.SICK,
            startDate: today,
            endDate: today,
            totalDays: 1,
            reason: "Doctor appointment and seasonal flu recovery.",
            status: LEAVE_STATUS.APPROVED,
        },
    ];

    await LeaveRequest.insertMany(leaveRequests);
    console.log(`Created ${leaveRequests.length} leave requests.`);

    console.log("\n==========================================");
    console.log("Database seeded successfully!");
    console.log("Credentials ready to use:");
    console.log("  • Admin:    admin@hrm.com        Password: Admin@123");
    console.log("  • HR:       hr@hrm.com           Password: Hr@12345");
    console.log("  • Employee: david.chen@hrm.com   Password: Employee@123");
    console.log("==========================================\n");

    await mongoose.disconnect();
}

seedDatabase().catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
});
