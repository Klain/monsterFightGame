import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import webSocketService from "./services/webSocketService";
import DatabaseService from "./services/databaseService";
import authRouter from "./routes/authRoutes";
import characterRoutes from "./routes/characterRoutes";
import combatRoutes from "./routes/combatRoutes";
import activitiesRoutes from "./routes/activityRoutes";
import storeRoutes from "./routes/storeRoutes";
import messageRoutes from "./routes/messageRoutes";


// Cargar la documentación Swagger
const swaggerDocument = YAML.load("./src/swagger.yaml");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 4000;

// Inicializa el caché antes de arrancar el servidor
(async () => {
  try {
    console.log("🔄 Inicializando caché...");
    await DatabaseService.initializeCache();
    console.log("✅ Caché inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error al inicializar el caché:", error);
    process.exit(1);
  }
})();

// Inicializar el servicio de WebSocket
webSocketService.initialize(io);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Rutas
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRouter);
app.use("/api/characters", characterRoutes);
app.use("/api/combat", combatRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/messages", messageRoutes);

// Cargar rutas de debug solo en modo desarrollo
if (process.env.NODE_ENV === "development") {
  //const debugRoutes = require("./routes/debugRoutes");
  //app.use("/api/debug", debugRoutes);
}

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
