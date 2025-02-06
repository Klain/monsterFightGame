//backend\src\services\activityService.js
const { db } = require("../database");
const { sendRealTimeNotification, connectedUsers } = require("../sessionManager"); // Importar correctamente
const { sendMessage } = require("../services/messageService");

/**
 * Notifica al jugador cuando una actividad se completa.
 */
async function notifyActivityCompletion(character_id, title, message) {
    try {
        const character = await db.get("SELECT * FROM characters WHERE id = ?", [character_id]);
        if (!character) return;

        if (connectedUsers.has(character.user_id)) {
            sendRealTimeNotification(character.user_id, message);
        } else {
            await sendMessage(0, character.user_id, title, message);
        }
    } catch (error) {
        console.error("Error al enviar notificación de actividad:", error);
    }
}

async function checkCompletedActivities() {
    try {
        const now = new Date();
        const activities = await db.all(
            "SELECT * FROM activities WHERE completed = FALSE"
        );

        for (const activity of activities) {
            const startTime = new Date(activity.start_time);
            const elapsedMinutes = Math.floor((now - startTime) / 60000);

            if (elapsedMinutes >= activity.duration) {
                await db.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

                const character = await db.get("SELECT * FROM characters WHERE id = ?", [activity.character_id]);
                if (!character) continue;

                // Añadir recompensas al personaje
                await db.run(
                    "UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?",
                    [activity.reward_xp, activity.reward_gold, activity.character_id]
                );

                const messageText = `Tu actividad '${activity.type}' ha terminado. Recolecta tu recompensa.`;

                if (connectedUsers.has(character.user_id)) {
                    sendRealTimeNotification(character.user_id, messageText);
                } else {
                    await sendMessage(0, character.user_id, "Actividad Finalizada", messageText);
                }
            }
        }
    } catch (error) {
        console.error("Error al verificar actividades completadas:", error);
    }
}


/**
 * Iniciar una actividad para un personaje.
 */
async function startActivity(user_id, character_id, type, duration, reward_xp, reward_gold, res) {
    try {
        // Verificar si el personaje ya está en una actividad
        const existingActivity = await db.get(
            "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
            [character_id]
        );

        if (existingActivity) {
            return res.status(400).json({ error: "Tu personaje ya está ocupado en otra actividad." });
        }

        // Registrar nueva actividad
        const start_time = new Date();
        await db.run(
            `INSERT INTO activities (user_id, character_id, type, start_time, duration, reward_xp, reward_gold) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, character_id, type, start_time, duration, reward_xp, reward_gold]
        );

        res.json({ message: `Has comenzado la actividad: ${type}. Duración: ${duration} minutos.` });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar la actividad." });
    }
}

/**
 * Consultar el estado de la actividad en curso.
 */
async function getActivityStatus(character_id, res) {
    try {
        const activity = await db.get(
            "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
            [character_id]
        );

        if (!activity) {
            return res.json({ message: "No tienes ninguna actividad en curso." });
        }

        const now = new Date();
        const startTime = new Date(activity.start_time);
        const elapsedMinutes = Math.floor((now - startTime) / 60000);

        const remainingMinutes = Math.max(activity.duration - elapsedMinutes, 0);
        const isCompleted = remainingMinutes === 0;

        res.json({
            type: activity.type,
            remainingMinutes,
            isCompleted,
            reward_xp: activity.reward_xp,
            reward_gold: activity.reward_gold,
        });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar el estado de la actividad." });
    }
}

/**
 * Reclamar recompensa tras completar la actividad.
 */
async function claimActivityReward(character_id, res) {
    try {
        const activity = await db.get(
            "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
            [character_id]
        );

        if (!activity) {
            return res.status(400).json({ error: "No tienes ninguna actividad para reclamar." });
        }

        const now = new Date();
        const startTime = new Date(activity.start_time);
        const elapsedMinutes = Math.floor((now - startTime) / 60000);

        if (elapsedMinutes < activity.duration) {
            return res.status(400).json({ error: "Aún no ha pasado el tiempo necesario." });
        }

        // Marcar actividad como completada
        await db.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

        // Añadir recompensas al personaje
        await db.run(
            "UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?",
            [activity.reward_xp, activity.reward_gold, character_id]
        );

        const messageText = `Has completado la actividad '${activity.type}' y ganado ${activity.reward_xp} XP y ${activity.reward_gold} de oro.`;

        // Llamamos a la función común de notificación
        await notifyActivityCompletion(character_id, "Actividad Completada", messageText);

        res.json({ message: messageText });
    } catch (error) {
        res.status(500).json({ error: "Error al reclamar la recompensa." });
    }
}



/**
 * Iniciar una actividad de sanación
 */
 async function startHealing(user_id, character_id, healingTime, res) {
    try {
        // Verificar si el personaje ya está en una actividad
        const existingActivity = await db.get(
            "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
            [character_id]
        );

        if (existingActivity) {
            return res.status(400).json({ error: "Tu personaje ya está ocupado en otra actividad." });
        }

        // Obtener información del personaje
        const character = await db.get("SELECT * FROM characters WHERE id = ?", [character_id]);

        if (!character) {
            return res.status(404).json({ error: "Personaje no encontrado." });
        }

        if (character.health >= 100) {
            return res.status(400).json({ error: "Tu personaje ya tiene la salud al máximo." });
        }

        // Calcular cuánta salud puede recuperar
        const maxRecoverableHealth = 100 - character.health;
        const maxPossibleTime = Math.ceil(maxRecoverableHealth / 2); // 2 de salud por minuto
        const finalHealingTime = Math.min(healingTime, maxPossibleTime);

        // Calcular costo total
        const totalCost = finalHealingTime * HEALING_COST_PER_MINUTE;

        if (character.currentGold < totalCost) {
            return res.status(400).json({ error: "No tienes suficiente oro para sanar por ese tiempo." });
        }

        const start_time = new Date();

        // Registrar actividad de sanación
        await db.run(
            `INSERT INTO activities (user_id, character_id, type, start_time, duration, reward_xp, reward_gold) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, character_id, "sanación", start_time, finalHealingTime, 0, -totalCost] // XP 0, oro negativo
        );

        // Descontar oro del jugador
        await db.run(
            "UPDATE characters SET currentGold = currentGold - ? WHERE id = ?",
            [totalCost, character_id]
        );

        res.json({
            message: `Has comenzado la sanación por ${finalHealingTime} minutos. Coste: ${totalCost} de oro.`,
            healing_time: finalHealingTime,
        });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar la sanación." });
    }
}

async function claimHealing(character_id, res) {
    try {
        const activity = await db.get(
            "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE AND type = 'sanación'",
            [character_id]
        );

        if (!activity) {
            return res.status(400).json({ error: "No tienes ninguna sanación en curso." });
        }

        const now = new Date();
        const startTime = new Date(activity.start_time);
        const elapsedMinutes = Math.floor((now - startTime) / 60000);

        if (elapsedMinutes < activity.duration) {
            return res.status(400).json({ error: "Aún no ha pasado el tiempo necesario." });
        }

        // Calcular salud recuperada
        const healthRecovered = activity.duration * 2;
        const character = await db.get("SELECT * FROM characters WHERE id = ?", [character_id]);

        const newHealth = Math.min(character.health + healthRecovered, 100);

        // Marcar actividad como completada
        await db.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

        // Restaurar salud
        await db.run("UPDATE characters SET health = ? WHERE id = ?", [newHealth, character_id]);

        const messageText = `Tu sanación ha finalizado. Has recuperado ${healthRecovered} puntos de salud.`;

        // Llamamos a la función común de notificación
        await notifyActivityCompletion(character_id, "Sanación Completada", messageText);

        res.json({ message: messageText, new_health: newHealth });
    } catch (error) {
        res.status(500).json({ error: "Error al reclamar la sanación." });
    }
}


module.exports = { startActivity, getActivityStatus, claimActivityReward , notifyActivityCompletion  };
