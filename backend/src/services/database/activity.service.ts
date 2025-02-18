import { db } from "../../database";

export interface dbActivity {
  id?: number;
  character_id: number;
  type: number;
  start_time: string; // Guardado en formato ISO (YYYY-MM-DD HH:MM:SS)
  duration: number;
  completed: boolean;
}

// 📌 Servicio para manejar las actividades en la base de datos
class ActivityService {
  // ✅ Crear una nueva actividad
  static async createActivity(activity: dbActivity): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO activities (character_id, type, start_time, duration, completed)
        VALUES (?, ?, ?, ?, ?);
      `;

      const params = [
        activity.character_id,
        activity.type,
        activity.start_time,
        activity.duration,
        activity.completed ? 1 : 0
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // ✅ Obtener una actividad por ID
  static async getActivityById(activityId: number): Promise<dbActivity | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM activities WHERE id = ?;`;
      db.get(query, [activityId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbActivity : null);
        }
      });
    });
  }

  // ✅ Obtener todas las actividades de un personaje
  static async getActivitiesByCharacterId(characterId: number): Promise<dbActivity[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM activities WHERE character_id = ?;`;
      db.all(query, [characterId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbActivity[]);
        }
      });
    });
  }

  // ✅ Actualizar el estado de una actividad (por ejemplo, marcarla como completada)
  static async updateActivity(activityId: number, updatedActivity: Partial<dbActivity>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE activities SET
          type = ?, start_time = ?, duration = ?, completed = ?
        WHERE id = ?;
      `;

      const params = [
        updatedActivity.type,
        updatedActivity.start_time,
        updatedActivity.duration,
        updatedActivity.completed ? 1 : 0,
        activityId
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ✅ Eliminar una actividad
  static async deleteActivity(activityId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM activities WHERE id = ?;`;
      db.run(query, [activityId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default ActivityService;
