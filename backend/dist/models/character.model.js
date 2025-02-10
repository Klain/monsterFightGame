"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
//backend\src\models\character.ts
class Character {
    constructor(data) {
        this.id = 0;
        this.userId = 0;
        this.name = "";
        this.faction = "";
        this.class = 1;
        this.level = 1;
        this.strength = 1;
        this.endurance = 1;
        this.constitution = 1;
        this.precision = 1;
        this.agility = 1;
        this.vigor = 1;
        this.spirit = 1;
        this.willpower = 1;
        this.arcane = 1;
        this.currentHealth = 100;
        this.totalHealth = 100;
        this.currentStamina = 100;
        this.totalStamina = 100;
        this.currentMana = 100;
        this.totalMana = 100;
        this.characterId = 0;
        this.currentXp = 0;
        this.totalXp = 0;
        this.currentGold = 0;
        this.totalGold = 0;
        this.upgradePoints = 0;
        Object.assign(this, data);
    }
    calculateUpgradeCost(attributeValue) {
        return 100 + attributeValue * 10;
    }
    getHealthPercentage() {
        return (this.currentHealth / this.totalHealth) * 100;
    }
    isDead() {
        return this.currentHealth <= 0;
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
exports.Character = Character;
