const Joi = require("joi");
const { LEAVE_STATUS, LEAVE_TYPE } = require("../constants");

const createLeaveSchema = Joi.object({
    leaveType: Joi.string().valid(...Object.values(LEAVE_TYPE)).required(),
    startDate: Joi.date().required(),
    endDate : Joi.date().min(Joi.ref("startDate")).required().messages({
        "date.min": "End date must be on or after start date",
    }),
    reason: Joi.string().allow(""),
});

const updateLeaveStatusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(LEAVE_STATUS)).required(),
    reviewNote: Joi.string().allow(""),
});

module.exports = {
    createLeaveSchema,
    updateLeaveStatusSchema,
};