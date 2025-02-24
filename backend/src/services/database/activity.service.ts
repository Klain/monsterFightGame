import { db } from "../../../data/database";

export interface dbActivity {
  id?: number;
  character_id: number;
  type: number;
  start_time: string; 
  duration: number;
  completed: boolean;
}

class ActivityService {
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
  static async updateActivity(updatedActivity: dbActivity): Promise<boolean> {
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
        updatedActivity.id
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
