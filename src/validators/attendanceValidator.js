const Joi = require("joi");
const { ATTENDANCE_STATUS } = require("../constants");

const manualAttendanceSchema = Joi.object({
    employee: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)).required(),
    note: Joi.string().allow("")
});


const updateAttendanceSchema = Joi.object({
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)),
    note: Joi.string().allow(""),
    clockIn: Joi.date(),
    clockOut: Joi.date()
}).min(1);

module.exports = {
    manualAttendanceSchema,
    updateAttendanceSchema
};