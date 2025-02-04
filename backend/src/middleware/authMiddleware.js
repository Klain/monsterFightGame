//backend\src\middleware\auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

module.exports = authMiddleware;
