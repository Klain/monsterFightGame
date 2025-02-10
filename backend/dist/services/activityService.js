"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = __importDefault(require("./databaseService"));
const sessionManager_1 = require("../sessionManager");
const messageService_1 = require("./messageService");
const HEALING_COST_PER_MINUTE = 10;
class ActivityService {
    // Función: Notificar finalización de actividad
    static async notifyActivityCompletion(character_id, title, message) {
        try {
            const character = await databaseService_1.default.get("SELECT * FROM characters WHERE id = ?", [character_id]);
            if (!character)
                return;
            if (sessionManager_1.connectedUsers.has(character.userId)) {
                (0, sessionManager_1.sendRealTimeNotification)(character.userId, message);
            }
            else {
                await (0, messageService_1.sendMessage)(0, character.userId, title, message);
            }
        }
        catch (error) {
            console.error("Error al enviar notificación de actividad:", error);
        }
    }
    // Función: Verificar actividades completadas
    static async checkCompletedActivities() {
        try {
            const now = new Date();
            const activities = await databaseService_1.default.all("SELECT * FROM activities WHERE completed = FALSE");
            for (const activity of activities) {
                const startTime = new Date(activity.startTime);
                const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
                if (elapsedMinutes >= activity.duration) {
                    await databaseService_1.default.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);
                    const character = await databaseService_1.default.get("SELECT * FROM characters WHERE id = ?", [activity.characterId]);
                    if (!character)
                        continue;
                    // Actualizar recompensas del personaje
                    await databaseService_1.default.run("UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?", [activity.rewardXp, activity.rewardGold, activity.characterId]);
                    const messageText = `Tu actividad '${activity.type}' ha terminado. Recolecta tu recompensa.`;
                    if (sessionManager_1.connectedUsers.has(character.userId)) {
                        (0, sessionManager_1.sendRealTimeNotification)(character.userId, messageText);
                    }
                    else {
                        await (0, messageService_1.sendMessage)(0, character.userId, "Actividad Finalizada", messageText);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error al verificar actividades completadas:", error);
        }
    }
    // Función: Iniciar actividad
    static async startActivity(user_id, character_id, type, duration, reward_xp, reward_gold, res) {
        try {
            const existingActivity = await databaseService_1.default.get("SELECT * FROM activities WHERE character_id = ? AND completed = FALSE", [character_id]);
            if (existingActivity) {
                return res.status(400).json({ error: "Tu personaje ya está ocupado en otra actividad." });
            }
            const start_time = new Date();
            await databaseService_1.default.run(`INSERT INTO activities (user_id, character_id, type, start_time, duration, reward_xp, reward_gold) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [user_id, character_id, type, start_time, duration, reward_xp, reward_gold]);
            return res.json({ message: `Has comenzado la actividad: ${type}. Duración: ${duration} minutos.` });
        }
        catch (error) {
            return res.status(500).json({ error: "Error al iniciar la actividad." });
        }
    }
    // Función: Consultar estado de la actividad
    static async getActivityStatus(character_id, res) {
        try {
            const activity = await databaseService_1.default.get("SELECT * FROM activities WHERE character_id = ? AND completed = FALSE", [character_id]);
            if (!activity) {
                return res.json({ message: "No tienes ninguna actividad en curso." });
            }
            const now = new Date();
            const startTime = new Date(activity.startTime);
            const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
            const remainingMinutes = Math.max(activity.duration - elapsedMinutes, 0);
            const isCompleted = remainingMinutes === 0;
            return res.json({
                type: activity.type,
                remainingMinutes,
                isCompleted,
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Error al consultar el estado de la actividad." });
        }
    }
    // Función: Reclamar recompensa de actividad
    static async claimActivityReward(character_id, res) {
        try {
            const activity = await databaseService_1.default.get("SELECT * FROM activities WHERE character_id = ? AND completed = FALSE", [character_id]);
            if (!activity) {
                return res.status(400).json({ error: "No tienes ninguna actividad para reclamar." });
            }
            const now = new Date();
            const startTime = new Date(activity.startTime);
            const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
            if (elapsedMinutes < activity.duration) {
                return res.status(400).json({ error: "Aún no ha pasado el tiempo necesario." });
            }
            // Marcar actividad como completada
            await databaseService_1.default.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);
            // Añadir recompensas al personaje
            await databaseService_1.default.run("UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?", [activity.rewardXp, activity.rewardGold, character_id]);
            return res.json({ message: "Recompensa reclamada exitosamente." });
        }
        catch (error) {
            return res.status(500).json({ error: "Error al reclamar la recompensa." });
        }
    }
}
exports.default = ActivityService;
