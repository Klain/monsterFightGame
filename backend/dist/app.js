"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const sessionManager_1 = require("./sessionManager");
const databaseService_1 = __importDefault(require("./services/databaseService"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const characterRoutes_1 = __importDefault(require("./routes/characterRoutes"));
const combatRoutes_1 = __importDefault(require("./routes/combatRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
// Cargar la documentación Swagger
const swaggerDocument = yamljs_1.default.load("./src/swagger.yaml");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const PORT = process.env.PORT || 4000;
// Inicializa el caché antes de arrancar el servidor
(async () => {
    try {
        console.log("🔄 Inicializando caché...");
        await databaseService_1.default.initializeCache();
        console.log("✅ Caché inicializado correctamente.");
    }
    catch (error) {
        console.error("❌ Error al inicializar el caché:", error);
        process.exit(1);
    }
})();
// Middlewares
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((req, res, next) => {
    next();
});
// Rutas
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/characters", characterRoutes_1.default);
app.use("/api/combat", combatRoutes_1.default);
app.use("/api/activities", activityRoutes_1.default);
app.use("/api/store", storeRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
// Cargar rutas de debug solo en modo desarrollo
if (process.env.NODE_ENV === "development") {
    //const debugRoutes = require("./routes/debugRoutes");
    //app.use("/api/debug", debugRoutes);
}
// Socket.IO
io.on("connection", (socket) => {
    console.log("Un usuario ha intentado conectar vía WebSockets:", socket.id);
    socket.on("register", (token) => {
        try {
            const decoded = jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
            if (typeof decoded === "object" && "id" in decoded) {
                const userId = decoded.id; // Asegúrate de que `id` es un número
                if (!sessionManager_1.connectedUsers.has(userId)) {
                    sessionManager_1.connectedUsers.set(userId, socket);
                    console.log(`Usuario ${userId} registrado en WebSockets.`);
                }
            }
        }
        catch (error) {
            console.error("Error en autenticación WebSockets:", error.message);
            socket.emit("error", { message: "Autenticación fallida" });
            return socket.disconnect();
        }
    });
    socket.on("disconnect", () => {
        sessionManager_1.connectedUsers.forEach((value, key) => {
            if (value === socket)
                sessionManager_1.connectedUsers.delete(key);
        });
        console.log("Usuario desconectado:", socket.id);
    });
});
// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
exports.default = app;
