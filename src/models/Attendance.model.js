const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../constants");

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    clockIn: {
        type: Date,
        default: null
    },
    clockOut: {
        type: Date,
        default: null
    },
    totalHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: Object.values(ATTENDANCE_STATUS),
        default: ATTENDANCE_STATUS.PRESENT
    },
    note: {
        type: String,
        default: "",
        trim: true
    },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);