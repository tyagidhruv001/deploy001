const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('customer', 'worker').required(),
    phone: Joi.string().required()
});

module.exports = {
    signupSchema
};
