"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currencies = void 0;
class Currencies {
    constructor(data) {
        this.characterId = 0;
        this.currentXp = 0;
        this.totalXp = 0;
        this.currentGold = 0;
        this.totalGold = 0;
        Object.assign(this, data);
    }
    // Método para calcular el nivel basado en la experiencia total
    getLevelFromXp() {
        return Math.floor(this.totalXp / 1000);
    }
    // Método para verificar si tiene suficiente oro
    hasEnoughGold(amount) {
        return this.currentGold >= amount;
    }
}
exports.Currencies = Currencies;
