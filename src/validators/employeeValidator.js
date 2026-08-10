const Joi = require("joi");
const { ACTIVE_STATUS } = require("../constants");

const createEmployeeSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    department: Joi.string().allow(""),
    position: Joi.string().allow(""),
    salary: Joi.number().min(0),
    hireDate: Joi.date(),
});


const updateEmployeeSchema = Joi.object({
    department: Joi.string().allow(""),
    position: Joi.string().allow(""),
    salary: Joi.number().min(0),
    phone: Joi.string(),
    hireDate: Joi.date(),
}).min(1);


const updateStatusSchema = Joi.object({
    status: Joi.string()
    .valid(...Object.values(ACTIVE_STATUS))
    .required()
});

module.exports = {
    createEmployeeSchema,
    updateEmployeeSchema,
    updateStatusSchema,
};