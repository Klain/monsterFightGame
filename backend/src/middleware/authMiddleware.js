//backend\src\middleware\auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado: No hay token." });
    }

    try {
        const formattedToken = token.replace("Bearer ", "").trim();
        const verified = jwt.verify(formattedToken, process.env.JWT_SECRET);
        req.user = verified; // Almacena los datos del usuario en `req.user`
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = authMiddleware;