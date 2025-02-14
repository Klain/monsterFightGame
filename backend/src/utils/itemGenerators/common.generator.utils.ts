import { ArmorMaterialType, EquipPositionType, Rarity, WeaponFamily, WeaponType } from "../../constants/enums";

// Determinar rareza del arma
export function rollRarity(chances: { rarity: Rarity; chance: number }[]): Rarity {
    const totalChance = chances.reduce((sum, entry) => sum + entry.chance, 0); // Suma total de probabilidades
    const roll = Math.random() * totalChance; // Número aleatorio en el rango 0-totalChance

    let accumulatedChance = 0;

    for (const entry of chances) {
        accumulatedChance += entry.chance;
        if (roll <= accumulatedChance) {
        return entry.rarity;
        }
    }

    // Default a COMMON si algo sale mal (esto debería ser raro)
    return Rarity.COMMON;
}
// Seleccionar una familia de armas
export function rollWeaponFamily(): WeaponFamily {
  const families = [
    WeaponFamily.FIST,
    WeaponFamily.DAGGER,
    WeaponFamily.SWORD,
    WeaponFamily.AXE,
    WeaponFamily.MACE,
    WeaponFamily.LANCE,
    WeaponFamily.THROWING,
    WeaponFamily.BOW,
    WeaponFamily.CROSSBOW,
    WeaponFamily.GUNPOWDER,
    WeaponFamily.RELIC,
    WeaponFamily.FOCUS,
    WeaponFamily.GRIMOIRE,
  ];
  return families[Math.floor(Math.random() * families.length)];
}
// Seleccionar un tipo de arma dentro de la familia
export  function rollWeaponType(family: WeaponFamily): WeaponType {
    const typesByFamily: Record<WeaponFamily, WeaponType[]> = {
        [WeaponFamily.FIST]: [WeaponType.GLOVE, WeaponType.CLAW],
        [WeaponFamily.DAGGER]: [WeaponType.DIRK, WeaponType.DAGGER],
        [WeaponFamily.SWORD]: [WeaponType.SABER, WeaponType.GREATSWORD],
        [WeaponFamily.AXE]: [WeaponType.HATCHET, WeaponType.AXE],
        [WeaponFamily.MACE]: [WeaponType.HAMMER, WeaponType.MACE],
        [WeaponFamily.LANCE]: [WeaponType.PILUM, WeaponType.LANCE],
        [WeaponFamily.THROWING]: [WeaponType.DART, WeaponType.VENABLO],
        [WeaponFamily.BOW]: [WeaponType.SHORT_BOW, WeaponType.LONGBOW],
        [WeaponFamily.CROSSBOW]: [WeaponType.CROSSBOW, WeaponType.ARBALEST],
        [WeaponFamily.GUNPOWDER]: [WeaponType.PISTOL, WeaponType.MUSKET],
        [WeaponFamily.RELIC]: [WeaponType.TALISMAN, WeaponType.SCEPTER],
        [WeaponFamily.FOCUS]: [WeaponType.SCROLL, WeaponType.WAND],
        [WeaponFamily.GRIMOIRE]: [WeaponType.GRIMOIRE, WeaponType.SEAL],
    };      
  const types = typesByFamily[family] || [];
  return types[Math.floor(Math.random() * types.length)];
}
// Generar nombre dinámico basado en rareza y familia
export  function generateWeaponName(rarity: Rarity, family: WeaponFamily): string {
    const rarityPrefixes: Record<Rarity, string> = {
        [Rarity.NONE]: "Sin clasificación",
        [Rarity.POOR]: "Pobre",
        [Rarity.COMMON]: "Común",
        [Rarity.UNCOMMON]: "Poco común",
        [Rarity.RARE]: "Raro",
        [Rarity.EPIC]: "Épico",
        [Rarity.UNIQUE]: "Único",
        [Rarity.LEGENDARY]: "Legendario",
      };

      const familyNames: Record<WeaponFamily, string> = {
        [WeaponFamily.FIST]: "Guantelete",
        [WeaponFamily.DAGGER]: "Daga",
        [WeaponFamily.SWORD]: "Espada",
        [WeaponFamily.AXE]: "Hacha",
        [WeaponFamily.MACE]: "Maza",
        [WeaponFamily.LANCE]: "Lanza",
        [WeaponFamily.THROWING]: "Arma Arrojadiza",
        [WeaponFamily.BOW]: "Arco",
        [WeaponFamily.CROSSBOW]: "Ballesta",
        [WeaponFamily.GUNPOWDER]: "Arma de Pólvora",
        [WeaponFamily.RELIC]: "Talismán",
        [WeaponFamily.FOCUS]: "Enfoque",
        [WeaponFamily.GRIMOIRE]: "Grimorio",
      };
      

  const prefix = rarityPrefixes[rarity] || "Misterioso";
  const baseName = familyNames[family] || "Arma";

  return `${prefix} ${baseName}`;
}
// Calcular el precio basado en bonificaciones y rareza
export function calculatePrice(attributes: Record<string, number>, rarity: Rarity): number {
  const rarityMultiplier: Record<Rarity, number> = {
    [Rarity.NONE]: 0,
    [Rarity.POOR]: 0.5,
    [Rarity.COMMON]: 1,
    [Rarity.UNCOMMON]: 1.5,
    [Rarity.RARE]: 2,
    [Rarity.EPIC]: 2.5,
    [Rarity.UNIQUE]: 3,
    [Rarity.LEGENDARY]: 3.5,
  };

  const basePrice = Object.values(attributes).reduce((sum, value) => sum + value * 10, 0);
  return Math.floor(basePrice * (rarityMultiplier[rarity] || 1));
}
export const positionNames: Record<EquipPositionType, string> = {
  [EquipPositionType.NONE]: "Sin posición",
  // Armaduras
  [EquipPositionType.HEAD]: "Casco",
  [EquipPositionType.CHEST]: "Pechera",
  [EquipPositionType.SHOULDER]: "Hombreras",
  [EquipPositionType.WRIST]: "Brazales",
  [EquipPositionType.LEGS]: "Perneras",
  // Joyas
  [EquipPositionType.NECKLACE]: "Collar",
  [EquipPositionType.RING1]: "Anillo",
  [EquipPositionType.RING2]: "Anillo",
  // Accesorios
  [EquipPositionType.HANDS]: "Guantes",
  [EquipPositionType.WAIST]: "Cinturón",
  [EquipPositionType.FEET]: "Botas",
  [EquipPositionType.BACK]: "Capa",
  [EquipPositionType.TRINKET1]: "Abalorio",
  [EquipPositionType.TRINKET2]: "Abalorio",
  // Armas
  [EquipPositionType.MAINHAND]: "Mano principal",
  [EquipPositionType.OFFHAND]: "Mano secundaria",
};

export const materialNames: Record<ArmorMaterialType, string> = {
  [ArmorMaterialType.CLOTH]: "de Tela",
  [ArmorMaterialType.LEATHER]: "de Cuero",
  [ArmorMaterialType.MAIL]: "de Malla",
  [ArmorMaterialType.PLATE]: "de Placas",
  0: ""
};

export const rarityPrefixes: Record<Rarity, string> = {
  [Rarity.NONE]: "Sin clasificación",
  [Rarity.POOR]: "Pobre",
  [Rarity.COMMON]: "Común",
  [Rarity.UNCOMMON]: "Poco común",
  [Rarity.RARE]: "Raro",
  [Rarity.EPIC]: "Épico",
  [Rarity.UNIQUE]: "Único",
  [Rarity.LEGENDARY]: "Legendario",
};

// Seleccionar el material de la armadura
export function rollArmorMaterial(): ArmorMaterialType {
  const materials = [
    ArmorMaterialType.CLOTH,
    ArmorMaterialType.LEATHER,
    ArmorMaterialType.MAIL,
    ArmorMaterialType.PLATE,
  ];
  return materials[Math.floor(Math.random() * materials.length)];
}

// Seleccionar la posición de la armadura
export function rollArmorPosition(): EquipPositionType {
  const positions = [
    EquipPositionType.HEAD,
    EquipPositionType.CHEST,
    EquipPositionType.SHOULDER,
    EquipPositionType.WRIST,
    EquipPositionType.LEGS,
    EquipPositionType.HANDS,
    EquipPositionType.FEET,
  ];
  return positions[Math.floor(Math.random() * positions.length)];
}

