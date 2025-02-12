//backend\src\routes\authRoutes.ts
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByUsername, createUser } from '../services/userServices';
import CharacterService from "../services/characterService";
import { registerSession, logoutUser, isSessionValid } from "../sessionManager";
import "dotenv/config";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Ruta: Registro
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: "El usuario ya existe." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, hashedPassword);

    await CharacterService.createCharacterForUser(newUser.id, username);

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
    const user = await getUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Credenciales inválidas." });
      return;
    }

    // Generar tokens
    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET!, { expiresIn: "7d" });

    registerSession(user.id, refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ error: "Error interno en el inicio de sesión." });
  }
});


// Ruta: Cerrar sesión
router.post("/logout", authMiddleware, (req: Request, res: Response) => {
  const userId = req.locals.user?.id || 0;
  logoutUser(userId);
    res.json({ success: true, message: "Sesión cerrada correctamente." });

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

router.post("/refresh-token", async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token requerido." });
    return;
  }

  try {
    // Verifica el refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as jwt.JwtPayload;

    // Opcional: Verifica que el refresh token esté en la sesión activa
    const activeToken = await isSessionValid(payload.id, refreshToken);
    if (!activeToken) {
      res.status(401).json({ message: "Refresh token inválido o no activo." });
      return;
    }

    // Genera un nuevo access token
    const accessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });

    res.json({ accessToken });
  } catch (err) {
    console.error("Error al refrescar token:", err);
    res.status(401).json({ message: "Refresh token inválido o expirado." });
  }
});



export default router;
