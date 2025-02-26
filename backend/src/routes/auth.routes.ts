//backend\src\routes\authRoutes.ts
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CacheDataService from "../services/cache/CacheDataService";
import { registerSession, logoutUser, isSessionValid } from "../sessionManager";
import authMiddleware from "../middleware/authMiddleware";
import "dotenv/config";
import { Character } from "../models/character.model";
import { User } from "../models/user.model";

const router = express.Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }
    const existingUser = CacheDataService.getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: "El usuario ya existe." });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await CacheDataService.createUser(new User ({
      id:0,
      username:username,
      password:hashedPassword,
    }));
    const newCharacter = await CacheDataService.createCharacter(new Character({
      userId:newUser.id,
      name:username
    }));
    res.status(201).json({ message: "Usuario y personaje creados exitosamente." });
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ error: "Error interno en el registro." });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }
    const user = CacheDataService.getUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Credenciales inválidas." });
      return;
    }
    
    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET!, { expiresIn: "7d" });
    registerSession(user.id, refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ error: "Error interno en el inicio de sesión." });
  }
});

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
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as jwt.JwtPayload;
    const isActive = await isSessionValid(payload.id, refreshToken);
    if (!isActive) {
      res.status(401).json({ error: "Refresh token inválido o no activo." });
      return;
    }
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
