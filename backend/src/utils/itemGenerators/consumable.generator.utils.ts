import { ItemDefinition } from "../../models/itemDefinition.model"; 
import { Rarity, ItemType } from "../../constants/enums";
import { rollRarity, calculatePrice, rarityPrefixes } from "./common.generator.utils";

// Generador Procedural de Consumibles
export function generateConsumable(level: number): ItemDefinition {
  const rarity = rollRarity([
    { rarity: Rarity.COMMON, chance: 70 },
    { rarity: Rarity.UNCOMMON, chance: 20 },
    { rarity: Rarity.RARE, chance: 8 },
    { rarity: Rarity.LEGENDARY, chance: 2 },
  ]);

  const effect = rollConsumableEffect();
  const effectValue = calculateEffectValue(level, rarity, effect);
  const duration = effect.isTemporary ? Math.floor(Math.random() * 5 + 1) : undefined; // Efecto temporal (opcional)

  return new ItemDefinition({
    id: Date.now(),
    name: generateConsumableName(rarity, effect),
    itemType: ItemType.CONSUMABLE,
    rarity: rarity,
    levelRequired: level,
    price: calculatePrice({ value: effectValue }, rarity), // Precio basado en efecto y rareza
    effects: [`${effect.type}:${effect.target}:${effectValue}${duration ? `:duration=${duration}` : ""}`], // Representación del efecto
  });
}

// Determinar el tipo de efecto del consumible
function rollConsumableEffect(): { type: string; target: string; isTemporary: boolean } {
  const effects = [
    { type: "restore", target: "health", isTemporary: false }, // Cura vida
    { type: "restore", target: "mana", isTemporary: false }, // Cura maná
    { type: "restore", target: "stamina", isTemporary: false }, // Cura energía
    { type: "addBuff", target: "strength", isTemporary: true }, // Buff de fuerza
    { type: "addBuff", target: "precision", isTemporary: true }, // Buff de precisión
    { type: "removeDebuff", target: "poison", isTemporary: false }, // Remover veneno
    { type: "removeDebuff", target: "bleeding", isTemporary: false }, // Remover sangrado
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

// Calcular la magnitud del efecto
function calculateEffectValue(level: number, rarity: Rarity, effect: { type: string; target: string }): number {
  const baseValue = level * 10; // Escala básica con el nivel
  const rarityMultiplier: Record<Rarity, number> = {
    [Rarity.NONE]: 0,
    [Rarity.POOR]: 0.8,
    [Rarity.COMMON]: 1,
    [Rarity.UNCOMMON]: 1.2,
    [Rarity.RARE]: 1.5,
    [Rarity.EPIC]: 1.8,
    [Rarity.UNIQUE]: 2,
    [Rarity.LEGENDARY]: 2.5,
  };
  return Math.floor(baseValue * (rarityMultiplier[rarity] || 1));
}

// Generar nombre dinámico del consumible
function generateConsumableName(rarity: Rarity, effect: { type: string; target: string }): string {
  const prefix = rarityPrefixes[rarity] || "Misterioso";
  const effectNames: Record<string, string> = {
    health: "Poción de Vida",
    mana: "Poción de Maná",
    stamina: "Poción de Energía",
    strength: "Elixir de Fuerza",
    precision: "Elixir de Precisión",
    poison: "Antídoto",
    bleeding: "Curación de Sangrado",
  };

  return `${prefix} ${effectNames[effect.target] || "Consumible"}`;
}
