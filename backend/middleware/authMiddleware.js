const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // get token from header
        const token = req.headers["authorization"];

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // remove "Bearer " if exists
        const cleanToken = token.startsWith("Bearer ")
            ? token.slice(7, token.length)
            : token;

        // verify token
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // attach user id to request
        req.user = verified;

        next();

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;