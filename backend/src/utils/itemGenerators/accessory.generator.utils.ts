import { ItemDefinition } from "../../models/itemDefinition.model";
import { Rarity, ItemType, EquipType, EquipPositionType } from "../../constants/enums";
import { rollRarity, calculatePrice, positionNames, rarityPrefixes } from "./common.generator.utils";

// Generador Procedural de Accesorios
export function generateAccessory(level: number): ItemDefinition {
  const rarity = rollRarity([
    { rarity: Rarity.COMMON, chance: 70 },
    { rarity: Rarity.UNCOMMON, chance: 20 },
    { rarity: Rarity.RARE, chance: 8 },
    { rarity: Rarity.LEGENDARY, chance: 2 },
  ]);

  const position = rollAccessoryPosition();
  const effects = generateAccessoryEffects(rarity);

  // Construir el accesorio
  return new ItemDefinition({
    id: Date.now(),
    name: generateAccessoryName(rarity, position),
    itemType: ItemType.EQUIPMENT,
    equipType: EquipType.ACCESSORY,
    equipPositionType: position,
    rarity: rarity,
    levelRequired: level,
    price: calculatePrice({}, rarity), // Sin bonificaciones numéricas, se calcula solo con rareza
    effects,
  });
}

// Seleccionar la posición del accesorio
function rollAccessoryPosition(): EquipPositionType {
  const positions = [
    EquipPositionType.HANDS,
    EquipPositionType.WAIST,
    EquipPositionType.FEET,
    EquipPositionType.BACK,
    EquipPositionType.TRINKET1,
    EquipPositionType.TRINKET2,
  ];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Generar efectos para un accesorio
function generateAccessoryEffects(rarity: Rarity): string[] {
  const allEffects = [
    "successChanceBoost", // Incremento de probabilidad de éxito en actividades
    "activityCooldownReduction", // Reducción de cooldown en actividades
    "goldGainBoost", // Más oro ganado
    "initiativeBoost", // Turno inicial gratis
    "dodgeChance", // Esquivar ataque inicial
    "critChanceBoost", // Crítico en los primeros turnos
    "xpBoost", // Más experiencia
    "itemDropChance", // Incrementa la probabilidad de encontrar objetos
  ];

  const numEffects = rarity === Rarity.LEGENDARY ? 3 : rarity === Rarity.RARE ? 2 : 1; // Más efectos según rareza
  const effects: string[] = [];

  for (let i = 0; i < numEffects; i++) {
    const effect = allEffects[Math.floor(Math.random() * allEffects.length)];
    if (!effects.includes(effect)) {
      effects.push(effect); // Evitar duplicados
    }
  }

  return effects;
}

// Generar nombre dinámico basado en rareza y posición
function generateAccessoryName(rarity: Rarity, position: EquipPositionType): string {
  const prefix = rarityPrefixes[rarity] || "Misterioso";
  const positionName = positionNames[position] || "Accesorio";

  return `${prefix} ${positionName}`;
}
