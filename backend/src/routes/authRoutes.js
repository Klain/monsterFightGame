//backend\src\routes\auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByUsername, createUser } = require("../database");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, hashedPassword);

        return res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const user = await getUserByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
});

module.exports = router;

