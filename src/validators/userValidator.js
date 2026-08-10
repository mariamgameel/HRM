const Joi = require("joi");

const updateUserSchema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().email(),
    phone: Joi.string(),
    password: Joi.string().min(6),
});

module.exports = {
    updateUserSchema
};