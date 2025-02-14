//backend\src\constants\enums.ts
export enum ActivityType {
    NONE,
    EXPLORE,
    HEAL,
    REST,
    MEDITATE,
    ENCHANTING,
}
export enum AttributeType {
    NONE,
    STRENGTH,
    ENDURANCE,
    CONSTITUTION,
    PRECISION,
    AGILITY,
    VIGOR,
    SPIRIT,
    WILLPOWER,
    ARCANE,
}
export enum CharacterClass {
    ADVENTURER,
    CORSAIR,
    TREASURE_HUNTER,
    ARCHEOMAGE,
}



export enum Profession {
    NONE = 0,
    //RECOLECCION
    HERBALISM = 1,          // Recoleccion > hierbas
    MINING = 2,             // Recoleccion > minerales
    SKINNING = 3,           // Recoleccion > pieles
    FISHING = 4,            // Recoleccion > peces
    //FABRICACION
    ALCHEMY = 5,            // Fabricacion > pociones
    BLACKSMITHING = 6,      //Fabricacion > Armas - armaduras > Malla - Placas
    LEATHERWORKING = 7,     // Fabricacion > Armaduras > Cuero
    TAILORING = 8,          // Fabricacion > Armaduras > Tela
    ENGINEERING = 9,        // Fabricacion > Abalorios
    JEWELCRAFTING = 10,     // Fabricacion > Joyas
    //SERVICIOS
    ENCHANTING = 11,        // Servicios > Encantamientos
    COOKING = 12,           // Servicios > Comida (Buffs)
    FIRSTAID = 13,         // Servicios > Curaciones

    //INSCRIPTION, , , , , , , , LOCKPICKING, POISONS, 

}
export enum ItemType {
    NONE = 0,          // Representa la ausencia de un tipo
    TRADEGOODS = 1,  // Ítems TRADEGOODSs (monedas, materiales de crafting)
    CONSUMABLE = 2,    // Ítems consumibles (pociones, comida, pergaminos)
    EQUIPMENT = 3,     // Objetos Equipables (armas, armaduras, etc.)    
}
export enum TradeGoodsType {

}
export enum EquipType{
    NONE = 0,
    ARMOR = 1,           // Armaduras (cascos, pecheras, etc.)
    WEAPON = 2,        // Armas (main-hand, off-hand)
    ACCESSORY = 3,     // Accesorios (cinturones, capas, guantes, botas)
    JEWEL = 4,          // Joyas (anillos, collares)
}
export enum Rarity {
    NONE = 0,
    POOR = 1,
    COMMON = 2,
    UNCOMMON = 3,
    RARE = 4,
    EPIC = 5,
    UNIQUE = 6,
    LEGENDARY = 7,
} 
export enum EquipPositionType {
    NONE = 0,          // Sin posición (ítems genéricos o no equipables)
    // Armaduras
    HEAD = 1,          // Casco
    CHEST = 3,         // Pechera
    SHOULDER = 4,      // Hombreras
    WRIST = 5,         // Brazales
    LEGS = 8,          // Perneras
    // Joyas
    NECKLACE = 2,      // Collar
    RING1 = 11,        // Anillo 1
    RING2 = 12,        // Anillo 2
    // Accesorios
    HANDS = 6,         // Guantes (Accesorios, no armaduras)
    WAIST = 7,         // Cinturón
    FEET = 9,          // Botas
    BACK = 10,         // Espalda (Capa o mochila)
    TRINKET1 = 13,     // Abalorio 1
    TRINKET2 = 14,     // Abalorio 2
    // Armas
    MAINHAND = 15,     // Mano principal
    OFFHAND = 16,      // Mano secundaria
}
export enum WeaponType {
    NONE = 0,
    GLOVE = 1,
    CLAW = 2,
    TOOL = 3,
    DIRK = 4,
    DAGGER = 5,
    QAMA = 6,
    GLADIUS = 7,
    SABER = 8,
    GREATSWORD = 9,
    HATCHET = 10,
    AXE = 11,
    BERDICHE = 12,
    HAMMER = 13,
    MACE = 14,
    SLEDGEHAMMER = 15,
    PILUM = 16,
    LANCE = 17,
    PIKE = 18,
    DART = 19,
    VENABLO = 20,
    HARPOON = 21,
    SHORT_BOW = 22,
    BOW = 23,
    LONGBOW = 24,
    REPEATER = 25,
    CROSSBOW = 26,
    ARBALEST = 27,
    PISTOL = 28,
    MUSKET = 29,
    BOMBARD = 30,
    RING = 31,
    TALISMAN = 32,
    SCEPTER = 33,
    WAND = 34,
    STAFF = 35,
    CROSIER = 36,
    SEAL = 37,
    SCROLL = 38,
    GRIMOIRE = 39,
}
export class WeaponTypeValues {
    private _damage: number;
    private _isMagic: boolean;
    private _range: number;
    private _twoHands: boolean;
    private _reload: number;
    private _aoe: number;
    private _precision: number;
    private _speed: number;
    private _actions: number;
    private _evasion: number;
    private _criticalRate: number;
    private _criticalDamage: number;
    private _energyCost: number;
    private _manaCost: number;

    constructor(
        damage: number,
        isMagic: boolean,
        range: number,
        twoHands: boolean,
        reload: number,
        aoe: number,
        precision: number,
        speed: number,
        actions: number,
        evasion: number,
        criticalRate: number,
        criticalDamage: number,
        energyCost: number,
        manaCost: number
    ) {
        this._damage = damage;
        this._isMagic = isMagic;
        this._range = range;
        this._twoHands = twoHands;
        this._reload = reload;
        this._aoe = aoe;
        this._precision = precision;
        this._speed = speed;
        this._actions = actions;
        this._evasion = evasion;
        this._criticalRate = criticalRate;
        this._criticalDamage = criticalDamage;
        this._energyCost = energyCost;
        this._manaCost = manaCost;
    }

    get damage(): number { return this._damage; }
    get isMagic(): boolean { return this._isMagic; }
    get range(): number { return this._range; }
    get twoHands(): boolean { return this._twoHands; }
    get reload(): number { return this._reload; }
    get aoe(): number { return this._aoe; }
    get precision(): number { return this._precision; }
    get speed(): number { return this._speed; }
    get actions(): number { return this._actions; }
    get evasion(): number { return this._evasion; }
    get criticalRate(): number { return this._criticalRate; }
    get criticalDamage(): number { return this._criticalDamage; }
    get energyCost(): number { return this._energyCost; }
    get manaCost(): number { return this._manaCost; }
}
//old
export enum WeaponFamily {
    FIST=1,
    DAGGER=2,
    SWORD=3,
    AXE=4,
    MACE=5,
    LANCE=6,
    THROWING=7,
    BOW=8,
    CROSSBOW=9,
    GUNPOWDER=10,
    RELIC=11,
    FOCUS=12,
    GRIMOIRE=13
}
export enum ArmorMaterialType {
    NONE = 0,
    CLOTH = 1,
    LEATHER = 2,
    MAIL = 3,
    PLATE = 4,
}
export enum Effects {
    NONE = 0,
    STRENGTH = 1,
    ENDURANCE = 2,
    CONSTITUTION = 3,
    PRECISION = 4,
    AGILITY = 5,
    VIGOR = 6,
    SPIRIT = 7,
    WILLPOWER = 8,
    ARCANE = 9,
}