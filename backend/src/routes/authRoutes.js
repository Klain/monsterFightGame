//backend\src\routes\auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByUsername, createUser } = require("../database");
const authenticateToken = require("../middleware/authMiddleware");
const { registerSession, logoutUser } = require("../sessionManager");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: "El usuario ya existe." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, hashedPassword);

        return res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (error) {
        console.error("Error en el registro de usuario:", error);
        return res.status(500).json({ error: "Error interno en el registro." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

        registerSession(user.id, token);
        return res.json({ token });
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        return res.status(500).json({ error: "Error interno en el inicio de sesión." });
    }
});

router.post("/logout", authenticateToken, (req, res) => {
    logoutUser(req.user.id);
    res.json({ success: true, message: "Sesión cerrada correctamente." });
});

router.get("/check-session", authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Sesión válida.",
            user: req.user,
        });
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        res.status(500).json({ error: "Error interno al verificar la sesión." });
    }
});


module.exports = router;
