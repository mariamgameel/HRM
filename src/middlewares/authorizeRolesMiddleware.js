const AppError = require("../utils/AppError");

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("Unauthorized", 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Access Denied", 403));
        }
        next();
    };
};
module.exports = authorizeRoles;