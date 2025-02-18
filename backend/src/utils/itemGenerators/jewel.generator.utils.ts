import { ItemDefinition } from "../../models/itemDefinition.model";
import { Rarity, ItemType, EquipType, EquipPositionType } from "../../constants/enums";
import { rollRarity, calculatePrice, positionNames, rarityPrefixes } from "./common.generator.utils";

// Generador Procedural de Joyas
export function generateJewel(level: number): ItemDefinition {
  const rarity = rollRarity([
    { rarity: Rarity.COMMON, chance: 70 },
    { rarity: Rarity.UNCOMMON, chance: 20 },
    { rarity: Rarity.RARE, chance: 8 },
    { rarity: Rarity.LEGENDARY, chance: 2 },
  ]);

  const position = rollJewelPosition();
  const bonuses = calculateJewelBonuses(level, position);

  // Construir la joya
  return new ItemDefinition({
    id: Date.now(),
    name: generateJewelName(rarity, position),
    itemType: ItemType.EQUIPMENT,
    equipType: EquipType.ACCESSORY, // Clasificación como accesorio
    equipPositionType: position,
    rarity: rarity,
    levelRequired: level,
    price: calculatePrice(bonuses, rarity),
    bonuses,
  });
}

// Seleccionar la posición de la joya (collar o anillo)
function rollJewelPosition(): EquipPositionType {
  const positions = [
    EquipPositionType.NECKLACE,
    EquipPositionType.RING1,
    EquipPositionType.RING2,
  ];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Determinar bonificaciones de joyas según posición y nivel
function calculateJewelBonuses(level: number, position: EquipPositionType): Record<string, number> {
  const bonuses: Record<string, number> = {
    strength: 0,
    precision: 0,
    spirit: 0,
    endurance: 0,
    constitution: 0,
    mana: 0,
    stamina: 0,
    health: 0,
  };

  switch (position) {
    case EquipPositionType.NECKLACE:
      // Collares se centran en mana, espíritu y resistencia
      bonuses.mana = Math.floor(Math.random() * (level * 2) + 5);
      bonuses.spirit = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      bonuses.endurance = Math.random() > 0.3 ? Math.floor(Math.random() * level + 2) : 0;
      break;

    case EquipPositionType.RING1:
    case EquipPositionType.RING2:
      // Anillos son más híbridos
      bonuses.strength = Math.random() > 0.5 ? Math.floor(Math.random() * level + 5) : 0;
      bonuses.health = Math.random() > 0.5 ? Math.floor(Math.random() * (level * 2) + 5) : 0;
      bonuses.precision = Math.random() > 0.3 ? Math.floor(Math.random() * level + 2) : 0;
      break;

    default:
      break;
  }

  return bonuses;
}

// Generar nombre dinámico basado en rareza y posición
function generateJewelName(rarity: Rarity, position: EquipPositionType): string {
  const prefix = rarityPrefixes[rarity] || "Misterioso";
  const positionName = positionNames[position] || "Accesorio";

  return `${prefix} ${positionName}`;
}
