"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = __importDefault(require("./databaseService"));
const sessionManager_1 = require("../sessionManager");
const messageService_1 = require("./messageService");
const characterService_1 = __importDefault(require("./characterService"));
class ActivityService {
    // Función: Notificar finalización de actividad
    static async notifyActivityCompletion(character, title, message) {
        try {
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
                    const rewards = this.calculateActivityReward(activity.type, activity.duration);
                    await characterService_1.default.updateCharacterRewards(character, rewards);
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
    static async startActivity(character, activity, duration) {
        return databaseService_1.default.run("INSERT INTO activities (character_id, type, start_time, duration, completed) VALUES (?, ?, CURRENT_TIMESTAMP, ?, FALSE)", [character.id, activity, duration]);
    }
    static async getActivityStatus(character) {
        const activity = await databaseService_1.default.get("SELECT * FROM activities WHERE character_id = ? AND completed = FALSE", [character.id]);
        if (!activity) {
            return { status: "idle" };
        }
        const remainingTime = activity.getRemainingTime();
        return remainingTime > 0
            ? { status: "in_progress", remainingTime }
            : { status: "completed" };
    }
    static async claimActivityReward(character) {
        const activity = await databaseService_1.default.get("SELECT * FROM activities WHERE character_id = ? AND completed = FALSE", [character.id]);
        if (!activity) {
            throw new Error("No hay una actividad para reclamar.");
        }
        const remainingTime = activity.getRemainingTime();
        if (remainingTime > 0) {
            throw new Error("La actividad aún no está completada.");
        }
        const rewards = this.calculateActivityReward(activity.type, activity.duration);
        await characterService_1.default.updateCharacterRewards(character, rewards);
        await databaseService_1.default.run("UPDATE activities SET completed = TRUE WHERE character_id = ?", [character.id]);
        return characterService_1.default.getCharacterById(character.id);
    }
    static calculateActivityReward(activityType, duration) {
        let reward = {};
        switch (activityType) {
            case "explorar":
                reward = { xp: duration * 5, gold: duration * 2 };
                break;
            case "sanar":
                reward = { health: duration * 5 };
                break;
            case "sanar":
                reward = { stamina: duration * 5 };
                break;
            case "meditar":
                reward = { mana: duration * 5 };
                break;
        }
        return reward;
    }
}
exports.default = ActivityService;
