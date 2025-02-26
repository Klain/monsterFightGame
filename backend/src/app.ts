import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import { initializeDatabase } from "./database/database";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import webSocketService from "./services/webSocketService";
import CacheDataService from "./services/cache/CacheDataService";

import activitiesRoutes from "./routes/activity.routes";
import authRouter from "./routes/auth.routes";
import characterRoutes from "./routes/characterRoutes";
import combatRoutes from "./routes/combatRoutes";
import friendshipRoutes from "./routes/friendship.routes";
import inventoryRoutes from "./routes/inventory.routes";
import lairRoutes from "./routes/lair.routes";
import messageRoutes from "./routes/messages.routes";
import shopRoutes from "./routes/shop.routes";

const PORT = process.env.PORT || 4000;
const swaggerDocument = YAML.load("./src/swagger.yaml");

// Inicializar la app de Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware para logs de solicitudes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Inicialización del caché y servicios
(async () => {
  try {
    console.log("🔄 Inicializando base de datos...");
    await initializeDatabase(); 

    console.log("🔄 Inicializando caché y base de datos...");
    await CacheDataService.initializeCache();
    console.log("✅ Caché inicializado correctamente.");

    // Inicializar el servicio de WebSocket
    webSocketService.initialize(io);
    console.log("✅ Servicio de WebSocket inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error durante la inicialización:", error);
    process.exit(1);
}})();

// Middlewares globales
app.use(cors());
app.use(bodyParser.json());

// Rutas públicas
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/activities", activitiesRoutes);
app.use("/api/auth", authRouter);
app.use("/api/characters", characterRoutes);
app.use("/api/combat", combatRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/lair", lairRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/shop", shopRoutes);

// Rutas de desarrollo
if (process.env.NODE_ENV === "development") {
  // Aquí podrías cargar rutas específicas de debugging si es necesario
  console.log("Modo desarrollo: rutas de debug activadas.");
}

// Manejo de errores global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error capturado:", err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
