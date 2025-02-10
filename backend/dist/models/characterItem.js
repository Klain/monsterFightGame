"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterItem = void 0;
class CharacterItem {
    constructor(data) {
        this.id = 0;
        this.characterId = 0;
        this.itemId = 0;
        this.equipped = false;
        Object.assign(this, data);
    }
}
exports.CharacterItem = CharacterItem;
