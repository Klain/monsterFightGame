//backend\src\app.js
require("dotenv").config();
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/swagger.yaml'); 


const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRouter = require("./routes/authRoutes");
const characterRoutes = require("./routes/characterRoutes");
const combatRoutes = require("./routes/combatRoutes");
const activitiesRoutes = require("./routes/activityRoutes");
const storeRoutes = require("./routes/storeRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { registerSession, logoutUser, sendRealTimeNotification, connectedUsers } = require("./sessionManager");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRouter);
app.use("/api/characters", characterRoutes);
app.use("/api/combat", combatRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/messages", messageRoutes);
// Cargar rutas de debug solo en modo desarrollo
if (process.env.NODE_ENV === "development") {
  const debugRoutes = require("./routes/debugRoutes");
  app.use("/api/debug", debugRoutes);
}

/**
 * Maneja la conexión de WebSockets con autenticación.
 */
io.on("connection", (socket) => {
  console.log("Un usuario ha intentado conectar vía WebSockets:", socket.id);

  socket.on("register", (token) => {
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      if (!connectedUsers.has(decoded.id)) {
        connectedUsers.set(decoded.id, socket);
        console.log(`Usuario ${decoded.id} registrado en WebSockets.`);
      }
    } catch (error) {
      console.log("Error en autenticación WebSockets:", error.message);
      socket.emit("error", { message: "Autenticación fallida" });
      return socket.disconnect();
    }
  });

  socket.on("disconnect", () => {
    connectedUsers.forEach((value, key) => {
      if (value === socket) connectedUsers.delete(key);
    });
    console.log("Usuario desconectado:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = { app };
