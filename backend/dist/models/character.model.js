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
        this.upgradePoints = 0;
        Object.assign(this, data);
    }
    calculateUpgradeCost(attributeValue) {
        return 100 + attributeValue * 10;
    }
    isValidAttribute(attribute) {
        const validAttributes = [
            "strength",
            "endurance",
            "constitution",
            "precision",
            "agility",
            "vigor",
            "spirit",
            "willpower",
            "arcane",
        ];
        return validAttributes.includes(attribute);
    }
}
exports.Character = Character;
