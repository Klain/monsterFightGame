const db = require("../database");

const HEALING_COST_PER_MINUTE = 1; // 1 oro por 2 puntos de salud recuperados


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

        res.json({
            message: `Actividad completada. Has ganado ${activity.reward_xp} XP y ${activity.reward_gold} de oro.`,
        });
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

/**
 * Reclamar la sanación tras completar el tiempo.
 */
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
        const healthRecovered = activity.duration * 2; // 2 de salud por minuto
        const character = await db.get("SELECT * FROM characters WHERE id = ?", [character_id]);

        const newHealth = Math.min(character.health + healthRecovered, 100);

        // Marcar actividad como completada
        await db.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

        // Restaurar salud
        await db.run("UPDATE characters SET health = ? WHERE id = ?", [newHealth, character_id]);

        res.json({
            message: `Sanación completada. Has recuperado ${healthRecovered} puntos de salud.`,
            new_health: newHealth,
        });
    } catch (error) {
        res.status(500).json({ error: "Error al reclamar la sanación." });
    }
}

module.exports = { startActivity, getActivityStatus, claimActivityReward };
