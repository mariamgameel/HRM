const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (err.name === "CastError") {
        err = new (require("../utils/AppError"))(`Invalid ${err.path}: ${err.value}`, 400);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err = new (require("../utils/AppError"))(`Duplicate value for field: ${field}`, 400);
    }
    if (process.env.NODE_ENV === "development") console.error(err);

    res.status(err.statusCode).json({
        success: false,
        msg: err.message || "Internal Server Error",
    });
};

module.exports = errorMiddleware;