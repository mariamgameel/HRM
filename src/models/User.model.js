const mongoose = require("mongoose");
const { ROLES, ACTIVE_STATUS } = require("../constants");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.EMPLOYEE
        },
        department: {
            type: String,
            default: ""
        },
        salary: {
            type: Number,
            default: 0
        },
        profileImage: {
            type: String,
            default: ""
        },
        position: {
            type: String,
            default: ""
        },
        hireDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: Object.values(ACTIVE_STATUS),
            default: ACTIVE_STATUS.ACTIVE,
        },
    }, {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);