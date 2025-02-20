//backend\src\routes\authRoutes.ts
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByUsername, createUser } from "../services/userServices";
import { registerSession, logoutUser, isSessionValid } from "../sessionManager";
import authMiddleware from "../middleware/authMiddleware";
import "dotenv/config";
import { Character } from "../models/character.model";
import DatabaseService from "../services/database/databaseService";

const router = express.Router();

// Ruta: Registro
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validación de entrada
    if (!username || !password) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: "El usuario ya existe." });
      return;
    }

    // Crear el usuario con contraseña encriptada
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, hashedPassword);

    // Crear un personaje inicial para el usuario
    const newCharacter = new Character({
      userId:newUser.id,
      name:username
    });
    await DatabaseService.createCharacter(newCharacter);

    res.status(201).json({ message: "Usuario y personaje creados exitosamente." });
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ error: "Error interno en el registro." });
  }
});

// Ruta: Inicio de sesión
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }

    const user = await getUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Credenciales inválidas." });
      return;
    }

    // Generar tokens
    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET!, { expiresIn: "7d" });

    // Registrar la sesión con el refresh token
    registerSession(user.id, refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ error: "Error interno en el inicio de sesión." });
  }
});

// Ruta: Cerrar sesión
router.post("/logout", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.locals.user?.id || 0;
    logoutUser(userId);

    res.json({ success: true, message: "Sesión cerrada correctamente." });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ error: "Error interno al cerrar sesión." });
  }
});

// Ruta: Verificar sesión
router.get("/check-session", authMiddleware, (req: Request, res: Response) => {
  const userId = req.locals.user?.id || 0;

  res.json({
    success: true,
    message: "Sesión válida.",
    user: userId,
  });
});

// Ruta: Renovar token
router.post("/refresh-token", async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token requerido." });
    return;
  }

  try {
    // Verificar el refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as jwt.JwtPayload;

    // Verificar que el token esté activo en la sesión
    const isActive = await isSessionValid(payload.id, refreshToken);
    if (!isActive) {
      res.status(401).json({ error: "Refresh token inválido o no activo." });
      return;
    }

    // Generar un nuevo access token
    const accessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });

    res.json({ accessToken });
  } catch (error:any) {
    console.error("Error al renovar token:", error);

    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Refresh token expirado. Por favor, inicia sesión nuevamente." });
    } else {
      res.status(401).json({ error: "Refresh token inválido." });
    }
  }
});

export default router;
