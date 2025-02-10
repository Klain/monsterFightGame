"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
class Status {
    constructor(data) {
        this.characterId = 0;
        this.currentHealth = 100;
        this.totalHealth = 100;
        this.currentStamina = 100;
        this.totalStamina = 100;
        this.currentMana = 100;
        this.totalMana = 100;
        Object.assign(this, data);
    }
    getHealthPercentage() {
        return (this.currentHealth / this.totalHealth) * 100;
    }
    isDead() {
        return this.currentHealth <= 0;
    }
}
exports.Status = Status;
