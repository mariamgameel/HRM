const mongoose = require("mongoose");
const { LEAVE_STATUS, LEAVE_TYPE } = require("../constants");

const leaveRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    leaveType: {
        type: String,
        enum: Object.values(LEAVE_TYPE),
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    totalDays: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        default: "",
        trim: true,
    },
    status: {
        type: String,
        enum : Object.values(LEAVE_STATUS),
        default: LEAVE_STATUS.PENDING,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    reviewNote: {
        type: String,
        default: "",
    },
}, { timestamps: true});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);