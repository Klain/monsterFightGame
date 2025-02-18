import { ItemDefinition } from "../../models/itemDefinition.model";
import { Rarity, ItemType, EquipType, EquipPositionType, ArmorMaterialType } from "../../constants/enums";
import { rollRarity, calculatePrice, positionNames, materialNames, rarityPrefixes, rollArmorMaterial, rollArmorPosition } from "./common.generator.utils";

// Generador Procedural de Armaduras
export function generateArmor(level: number): ItemDefinition {
  const rarity = rollRarity([
    { rarity: Rarity.COMMON, chance: 70 },
    { rarity: Rarity.UNCOMMON, chance: 20 },
    { rarity: Rarity.RARE, chance: 8 },
    { rarity: Rarity.LEGENDARY, chance: 2 },
  ]);
  const material = rollArmorMaterial();
  const position = rollArmorPosition();
  const bonuses = calculateArmorBonuses(level, material);
  // Construir la armadura
  return new ItemDefinition({
    id: Date.now(),
    name: generateArmorName(rarity, material, position), 
    itemType: ItemType.EQUIPMENT,
    equipType: EquipType.ARMOR,
    equipPositionType: position,
    armorMaterialType: material,
    rarity: rarity,
    levelRequired: level,
    price: calculatePrice(bonuses, rarity),
    bonuses,
  });
}

// Determinar bonificaciones defensivas basadas en el material y el nivel
function calculateArmorBonuses(level: number, material: ArmorMaterialType): Record<string, number> {
  const bonuses: Record<string, number> = {
    endurance: 0,
    constitution: 0,
    health: 0,
    spirit: 0,
    agility: 0,
  };

  switch (material) {
    case ArmorMaterialType.CLOTH:
      bonuses.constitution = Math.floor(Math.random() * (level * 1.5) + 5);
      bonuses.spirit = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    case ArmorMaterialType.LEATHER:
      bonuses.endurance = Math.floor(Math.random() * (level * 2) + 5);
      bonuses.agility = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    case ArmorMaterialType.MAIL:
      bonuses.endurance = Math.floor(Math.random() * (level * 2) + 5);
      bonuses.constitution = Math.floor(Math.random() * level + 3);
      break;

    case ArmorMaterialType.PLATE:
      bonuses.endurance = Math.floor(Math.random() * (level * 2.5) + 5);
      bonuses.health = Math.floor(Math.random() * (level * 3) + 10);
      break;

    default:
      bonuses.endurance = Math.floor(Math.random() * (level * 2) + 5);
      break;
  }

  return bonuses;
}

// Generar nombre dinámico basado en rareza, material y posición
function generateArmorName(rarity: Rarity, material: ArmorMaterialType, position: EquipPositionType): string {
  const prefix = rarityPrefixes[rarity] || "Misterioso";
  const materialName = materialNames[material] || "Genérico";
  const positionName = positionNames[position] || "Armadura";

  return `${prefix} ${positionName} ${materialName}`;
}
