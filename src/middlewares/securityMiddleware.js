const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, msg: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, msg: "Too many login attempts, please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});


const sanitizeInPlace = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }
        if (obj[key] && typeof obj[key] === "object") {
            sanitizeInPlace(obj[key]);
        }
    }
    return obj;
};


const mongoSanitizeMiddleware = (req, res, next) => {
    sanitizeInPlace(req.body);
    sanitizeInPlace(req.params);
    sanitizeInPlace(req.query);
    next();
};


module.exports = {
    helmetMiddleware: helmet(),
    generalLimiter,
    loginLimiter,
    mongoSanitizeMiddleware,
}