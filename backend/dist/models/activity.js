"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
class Activity {
    constructor(data) {
        this.id = 0;
        this.userId = 0;
        this.characterId = 0;
        this.type = ""; // Ejemplo: "training", "healing", "work"
        this.startTime = new Date();
        this.duration = 0; // En minutos
        this.rewardXp = 0;
        this.rewardGold = 0;
        this.completed = false;
        Object.assign(this, data);
    }
    // Método para calcular el tiempo restante en minutos
    getRemainingTime() {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - this.startTime.getTime()) / 60000);
        return Math.max(this.duration - elapsed, 0);
    }
}
exports.Activity = Activity;
