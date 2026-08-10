const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Access Denied" });
    }
    const token = authHeader.split(" ") [1];
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ msg: "Token expired or invalid" });
    }
};
module.exports = auth;