import { Character } from "../models/character.model";
import { CharacterClass, Rarity, WeaponType, WeaponTypeValues } from "./enums";

class ServerConfig {
    static DEBUG_MODE = true;


    //Assault
    static assault = {
        searchCost: 10,
        maxTurns:10,
        attackEnergyCost:1,
        defendEnergyCost:1,
        winnerXpBonus:1.2,
    };


     // 1. Configuración general
     public static readonly actionTime: number = 2000;
     public static readonly actionLevel = (level: number): number => (level * (level + 1));
     public static readonly xpPerAction: number = 50;
     public static readonly xpReward = (): number => {
         const range = ServerConfig.xpPerAction * 0.2;
         const randomVariation = (Math.random() * (2 * range)) - range;
         const result = Math.ceil(ServerConfig.xpPerAction + randomVariation);
         return result < 1 ? 1 : result;
     };
     public static readonly actionsBeforeRest: number = 60;
 
     // 2. Oro 
     public static readonly goldPerAction: number = 50;
     public static readonly goldReward = (actions:number): number => {
         const range = ServerConfig.goldPerAction * 0.2;
         const randomVariation = (Math.random() * (2 * range)) - range;
         const result = Math.ceil((ServerConfig.goldPerAction + randomVariation)*actions);
         return result < 1 ? 1 : result;
     };
     public static readonly salePriceMultiplier: number = 0.5;
 
 
     // 3. Niveles
     public static readonly maxLevel: number = 100;
     public static readonly xpToLevelUp = (newLevel: number): number => ServerConfig.actionLevel(newLevel + 1) * ServerConfig.xpPerAction;
 
     // 4. Configuración de barras de energía y recursos
     public static readonly baseHealth: number = 100;
     public static readonly baseEnergy: number = 100;
     public static readonly maxEnergy: number = 300;
     public static readonly baseMana: number = 100;
     public static readonly maxMana: number = 300;
 
      // 4.1 Configuración de atributos
     public static readonly numAttributes: number = 9;
     public static readonly baseAttribute: number = 10;
     public static readonly maxAttributeLevel: number = 89;
     public static readonly xpToLevelUpAttribute = (currentLevel: number): number =>
         ServerConfig.actionLevel(currentLevel + 1) * ServerConfig.xpPerAction / ServerConfig.numAttributes;
     public static readonly xpForAttributeLevel = (targetLevel: number): number => {
         let totalXp = 0;
         for (let level = 1; level <= targetLevel; level++) {
         totalXp += ServerConfig.xpToLevelUpAttribute(level);
         }
         return totalXp;
     };
     public static readonly baseEvasion: number = 0.05;
     public static readonly maxEvasion: number = 0.8;
     public static readonly agilityEvasion: number = (ServerConfig.maxEvasion - ServerConfig.baseEvasion) / ServerConfig.maxAttributeLevel;
     public static readonly baseArmor: number = ServerConfig.baseEvasion;
     public static readonly maxArmor: number = ServerConfig.maxEvasion;
     public static readonly enduranceArmor: number = (ServerConfig.maxArmor - ServerConfig.baseArmor) / ServerConfig.maxAttributeLevel;
     public static readonly baseMagicArmor: number = ServerConfig.baseEvasion;
     public static readonly maxMagicArmor: number = ServerConfig.maxEvasion;
     public static readonly willpowerMagicArmor: number = (ServerConfig.maxMagicArmor - ServerConfig.baseMagicArmor) / ServerConfig.maxAttributeLevel;
     public static readonly maxHealth: number = ServerConfig.baseHealth * (1 / (1 - ServerConfig.maxEvasion));
 
     // 4.2 Relacion atributos y estados
     public static readonly constitutionHealth: number = Math.floor((ServerConfig.maxHealth - ServerConfig.baseHealth) / ServerConfig.maxAttributeLevel);
     public static readonly vigorEnergy: number = Math.floor((ServerConfig.maxEnergy - ServerConfig.baseEnergy) / ServerConfig.maxAttributeLevel);
     public static readonly arcaneMana: number = Math.floor((ServerConfig.maxMana - ServerConfig.baseMana) / ServerConfig.maxAttributeLevel);
 
 
     // 5. Critico
     public static readonly baseCrit: number = 0.05;
     public static readonly maxCrit: number = 0.8;
     public static readonly critMultiplier: number = 10.16;
     public static readonly precisionCrit: number = (ServerConfig.maxCrit - ServerConfig.baseCrit) / ServerConfig.maxAttributeLevel;
 
 
     // 6. Configuración de clases
     public static readonly classMultipliers: Record<CharacterClass, Record<string, number>> = {
         [CharacterClass.ADVENTURER]: {
             physical: 1.0,
             technical: 1.0,
             magical: 1.0,
         },
         [CharacterClass.CORSAIR]: {
             physical: 0.75,
             technical: 1.0,
             magical: 1.0,
         },
         [CharacterClass.TREASURE_HUNTER]: {
             physical: 1.0,
             technical: 0.75,
             magical: 1.0,
         },
         [CharacterClass.ARCHEOMAGE]: {
             physical: 1.0,
             technical: 1.0,
             magical: 0.75,
         },
     };
     public static readonly attributeTypes: Record<string, 'physical' | 'technical' | 'magical'> = {
         strength: 'physical',
         endurance: 'physical',
         constitution: 'physical',
         precision: 'technical',
         agility: 'technical',
         vigor: 'technical',
         spirit: 'magical',
         willpower: 'magical',
         arcane: 'magical',
     };
     public static getCostMultiplierForClass(
         charClass: CharacterClass,
         attributeType: 'physical' | 'technical' | 'magical',
     ): number {
         const classData = ServerConfig.classMultipliers[charClass];
         return classData?.[attributeType] ?? 1.0;
     }
 
     // 7.Inventario
     public static readonly backpackSize: number = 20;
 
     // 8. Objetos
     public static readonly itemLevelPerLevel: number = 9;
     public static readonly maxItemLevel: number = this.maxLevel * this.itemLevelPerLevel;
     public static readonly baseItemLevelVariance: number = 0.01;
     public static readonly maxLevelVariance: number = this.maxLevel*(this.baseItemLevelVariance*Object.keys(Rarity).filter(key => isNaN(Number(key))).length);
     public static readonly itemLevelVariance: number = Math.min(this.maxLevelVariance,3)*this.itemLevelPerLevel;
     public static calculateItemLevel(character: Character,suerte:number=Math.random()): number {
         if(!character){return 1}
         return ((character.level / this.maxLevel) * this.maxItemLevel)+(suerte*this.itemLevelVariance);
     }
     public static getItemLucky(character: Character, itemLevel: number): number {
         if(!character){return 1}
         const baseItemLevel = (character.level / this.maxLevel) * this.maxItemLevel;
         const suerte = (itemLevel - baseItemLevel) / this.itemLevelVariance;
         return Math.max(0, Math.min(1, suerte));
     }
     public static readonly stockComsumable: number = 20;
     public static readonly stockTRADEGOODS: number = 200;
     public static readonly stockEquipable: number = 1;
     public static readonly weaponTypeValues : Map<WeaponType, WeaponTypeValues> =  new Map<WeaponType, WeaponTypeValues>([
         [WeaponType.GLOVE, new WeaponTypeValues(0.63, false, 0, false, 0.0, 0, 0.8, 8, 1.6, 0.25, 0.0, 0.0, 3, 0)],
         [WeaponType.CLAW, new WeaponTypeValues(0.58, false, 0, false, 0.0, 0, 0.8, 9, 1.8, 0.2, 0.0, 0.0, 2, 0)],
         [WeaponType.TOOL, new WeaponTypeValues(0.48, false, 0, false, 0.0, 0, 0.8, 10, 2.0, 0.3, 0.0, 0.0, 2, 0)],
         [WeaponType.DIRK, new WeaponTypeValues(0.43, false, 0, false, 0.0, 0, 0.8, 9, 1.8, 0.0, 0.3, 0.3, 2, 0)],
         [WeaponType.DAGGER, new WeaponTypeValues(0.52, false, 0, false, 0.0, 0, 0.8, 8, 1.6, 0.0, 0.25, 0.25, 3, 0)],
         [WeaponType.QAMA, new WeaponTypeValues(0.64, false, 0, false, 0.0, 0, 0.8, 7, 1.4, 0.0, 0.2, 0.2, 3, 0)],
         [WeaponType.GLADIUS, new WeaponTypeValues(0.89, false, 0, false, 0.0, 0, 0.8, 7, 1.4, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.SABER, new WeaponTypeValues(1.19, false, 0, false, 0.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.GREATSWORD, new WeaponTypeValues(1.67, false, 0, false, 0.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.HATCHET, new WeaponTypeValues(1.19, false, 0, false, 0.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.AXE, new WeaponTypeValues(1.67, false, 0, false, 0.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.BERDICHE, new WeaponTypeValues(2.5, false, 0, false, 0.0, 0, 0.5, 4, 0.8, 0.0, 0.0, 0.0, 5, 0)],
         [WeaponType.HAMMER, new WeaponTypeValues(1.19, false, 0, false, 0.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.MACE, new WeaponTypeValues(1.67, false, 0, false, 0.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.SLEDGEHAMMER, new WeaponTypeValues(2.5, false, 0, false, 0.0, 0, 0.5, 4, 0.8, 0.0, 0.0, 0.0, 5, 0)],
         [WeaponType.PILUM, new WeaponTypeValues(0.89, false, 0, false, 0.0, 0, 0.8, 7, 1.4, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.LANCE, new WeaponTypeValues(1.19, false, 0, false, 0.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.PIKE, new WeaponTypeValues(1.67, false, 0, false, 0.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.DART, new WeaponTypeValues(0.37, false, 1, false, 0.0, 1, 0.8, 7, 1.4, 0.0, 0.0, 0.0, 2, 0)],
         [WeaponType.VENABLO, new WeaponTypeValues(0.99, false, 1, false, 0.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.HARPOON, new WeaponTypeValues(1.39, false, 1, false, 0.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.SHORT_BOW, new WeaponTypeValues(1.12, false, 1, false, 0.5, 0, 0.8, 7, 1.4, 0.0, 0.0, 0.0, 2, 0)],
         [WeaponType.BOW, new WeaponTypeValues(1.49, false, 2, false, 1.0, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 2, 0)],
         [WeaponType.LONGBOW, new WeaponTypeValues(2.08, false, 3, false, 1.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.REPEATER, new WeaponTypeValues(1.98, false, 1, false, 1.5, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.CROSSBOW, new WeaponTypeValues(2.78, false, 2, false, 1.5, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.ARBALEST, new WeaponTypeValues(4.17, false, 3, false, 2.0, 0, 0.5, 4, 0.8, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.PISTOL, new WeaponTypeValues(1.98, false, 1, false, 1.5, 0, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.MUSKET, new WeaponTypeValues(2.78, false, 3, false, 2.0, 0, 0.6, 5, 1.0, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.BOMBARD, new WeaponTypeValues(1.39, false, 2, false, 2.0, 2, 0.5, 4, 0.8, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.RING, new WeaponTypeValues(0.69, true, 0, false, 0.0, 1, 0.9, 8, 1.6, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.TALISMAN, new WeaponTypeValues(0.74, true, 0, false, 0.25, 2, 0.8, 7, 1.4, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.SCEPTER, new WeaponTypeValues(0.99, true, 0, false, 0.66, 3, 0.7, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.WAND, new WeaponTypeValues(0.99, true, 0, false, 0.25, 1, 0.9, 7, 1.4, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.STAFF, new WeaponTypeValues(1.16, true, 0, false, 0.6, 2, 0.8, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.CROSIER, new WeaponTypeValues(1.79, true, 0, false, 1.5, 3, 0.7, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.SEAL, new WeaponTypeValues(1.16, true, 0, false, 0.25, 1, 0.9, 6, 1.2, 0.0, 0.0, 0.0, 3, 0)],
         [WeaponType.SCROLL, new WeaponTypeValues(1.39, true, 0, false, 0.6, 2, 0.8, 5, 1.0, 0.0, 0.0, 0.0, 4, 0)],
         [WeaponType.GRIMOIRE, new WeaponTypeValues(4.46, true, 0, false, 4.0, 3, 0.7, 4, 0.8, 0.0, 0.0, 0.0, 5, 0)]
     ]);
   
     //revisar la formula que la he puesto por poner.
     public static valuePerItemLevel(itemLevel: number): number {
         return this.goldReward(itemLevel);
     }
 
     // 10. Acciones simples
     public static readonly healthRegenPerMinute: number = 1;
     public static readonly energyRegenPerMinute: number = 1;
     public static readonly manaRegenPerMinute: number = 1;
 
     // 11. Configuración de exploración
     public static readonly baseExplorationCost: number = 10;
     public static readonly explorationSuccessRate: number = 0.75;
     public static readonly randomExplorationCost = (): number => {
         const range = ServerConfig.baseExplorationCost * 0.2;
         const randomVariation = (Math.random() * (2 * range)) - range;
         const result = Math.ceil(ServerConfig.baseExplorationCost + randomVariation);
         return result < 1 ? 1 : result;
     };
 
     // 12. Configuración de combate
     public static readonly combatEvasion = (agility: number): number =>
     ServerConfig.baseEvasion + ServerConfig.agilityEvasion * agility;
     public static readonly combatDamage = (strength: number): number =>
     Math.floor((strength * ServerConfig.maxHealth) / ServerConfig.maxAttributeLevel / ServerConfig.maxCombatDuration);
     public static readonly maxCombatDuration: number = 10;
     public static readonly combatArmor = (endurance: number): number => (ServerConfig.baseArmor + (ServerConfig.enduranceArmor * endurance));
     public static readonly combatCritChance = (precision: number): number => (ServerConfig.baseCrit + (ServerConfig.precisionCrit * precision));
     public static readonly combatMagicDamage = (spirit: number): number => Math.floor(spirit * (ServerConfig.maxHealth / ServerConfig.maxAttributeLevel) / ServerConfig.maxCombatDuration);
     public static readonly combatMagicArmor = (willpower: number): number => (ServerConfig.baseMagicArmor + (ServerConfig.willpowerMagicArmor * willpower));
     public static readonly stolenGoldRate: number = 0.1;
 
     // 13. Herreria
     
     // 14. Encantamiento
     public static readonly enchantingBaseCost: number = 10;
 
     // 15. Comercio
     public static readonly globalShopItemCount: number = 10;
     /*public static readonly calculatePrice = (itemInstance: ItemInstance): number => ( 10
     );*/
     public static readonly playerShopRotationInterval: number = 72000000;
     public static readonly playerShopItemCount: number = 10;
    
 
     // 99. Funciones auxiliares
     public static readonly formatTime = (time: number): string => {
     const hours = Math.floor(time / (1000 * 60 * 60));
     const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
     const seconds = Math.floor((time % (1000 * 60)) / 1000);
     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
     };
     public static readonly formatMoney = (money: number): string => {
     const gold = Math.floor(money / (100 * 100));
     const silver = Math.floor((money % (100 * 100)) / 100);
     const copper = Math.floor((money % (100 * 100)) % 100);
     return `${gold.toString().padStart(2, '0')}g ${silver.toString().padStart(2, '0')}s ${copper.toString().padStart(2, '0')}c`;
     };
 

}
export default ServerConfig

