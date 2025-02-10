"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor(data) {
        this.id = 0;
        this.name = "";
        this.type = "weapon";
        this.attackBonus = 0;
        this.defenseBonus = 0;
        this.price = 0;
        this.rarity = "common";
        this.levelRequired = 1;
        Object.assign(this, data);
    }
    // Método para verificar si un personaje cumple el nivel requerido
    canBeEquippedBy(character) {
        return character.level >= this.levelRequired;
    }
}
exports.Item = Item;
