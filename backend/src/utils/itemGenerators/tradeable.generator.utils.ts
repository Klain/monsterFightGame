import { Item } from "../../models/item.model";
import { ItemType, Profession, Rarity } from "../../constants/enums";
import { rollRarity, calculatePrice, rarityPrefixes } from "./common.generator.utils";

// Generador de Trade Goods
export function generateTradeGood(level: number, profession: Profession): Item {
  const rarity = rollRarity([
    { rarity: Rarity.COMMON, chance: 60 },
    { rarity: Rarity.UNCOMMON, chance: 25 },
    { rarity: Rarity.RARE, chance: 10 },
    { rarity: Rarity.LEGENDARY, chance: 5 },
  ]);

  const category = rollCategoryByProfession(profession);
  const material = rollMaterialByCategory(category);
  const quantity = rollQuantity(level, rarity);
  const basePrice = calculateTradeGoodPrice(rarity, quantity);

  return new Item({
    id: Date.now(),
    name: generateTradeGoodName(rarity, material, quantity),
    itemType: ItemType.TRADEGOODS,
    rarity: rarity,
    levelRequired: level,
    price: basePrice,
    effects: [`quantity:${quantity}`, `category:${category}`], // Guardamos información del stack y categoría en effects
  });
}

// Determinar la categoría basada en la profesión
function rollCategoryByProfession(profession: Profession): string {
  const categoryMap: Record<Profession, string[]> = {
      [Profession.HERBALISM]: ["Hierba"],
      [Profession.MINING]: ["Mineral"],
      [Profession.SKINNING]: ["Piel"],
      [Profession.FISHING]: ["Pescado"],
      [Profession.ALCHEMY]: ["Hierba"],
      [Profession.BLACKSMITHING]: ["Mineral"],
      [Profession.LEATHERWORKING]: ["Piel"],
      [Profession.TAILORING]: ["Tela"],
      [Profession.ENGINEERING]: ["Mineral", "Gema"],
      [Profession.JEWELCRAFTING]: ["Gema"],
      [Profession.ENCHANTING]: ["Gema"],
      [Profession.COOKING]: ["Hierba", "Pescado"],
      [Profession.FIRSTAID]: ["Tela", "Hierba"],
      0: []
  };

  const categories = categoryMap[profession] || ["Material Genérico"];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Seleccionar un material basado en la categoría
function rollMaterialByCategory(category: string): string {
  const materialsByCategory: Record<string, string[]> = {
    Hierba: ["Ginseng", "Lavanda", "Raíz de Mandrágora", "Flor de Loto"],
    Mineral: ["Hierro", "Plata", "Oro", "Platino"],
    Piel: ["Cuero", "Piel Gruesa", "Piel Escamada", "Piel de Dragón"],
    Gema: ["Amatista", "Zafiro", "Rubí", "Diamante"],
    Pescado: ["Salmón", "Trucha", "Anguila", "Pez Espada"],
    Tela: ["Lana", "Seda", "Lino", "Tela Encantada"],
  };

  const materials = materialsByCategory[category] || ["Material Genérico"];
  return materials[Math.floor(Math.random() * materials.length)];
}

// Determinar la cantidad del material
function rollQuantity(level: number, rarity: Rarity): number {
  const baseQuantity = Math.floor(Math.random() * 10 + 5); // Base aleatoria entre 5 y 15
  const rarityMultiplier: Record<Rarity, number> = {
    [Rarity.NONE]: 1,
    [Rarity.POOR]: 1,
    [Rarity.COMMON]: 1.2,
    [Rarity.UNCOMMON]: 1.5,
    [Rarity.RARE]: 2,
    [Rarity.EPIC]: 2.5,
    [Rarity.UNIQUE]: 3,
    [Rarity.LEGENDARY]: 4,
  };

  return Math.floor(baseQuantity * (rarityMultiplier[rarity] || 1));
}

// Calcular el precio del Trade Good
function calculateTradeGoodPrice(rarity: Rarity, quantity: number): number {
  const baseValue = 10; // Valor base por unidad
  const rarityMultiplier: Record<Rarity, number> = {
    [Rarity.NONE]: 1,
    [Rarity.POOR]: 1,
    [Rarity.COMMON]: 1.2,
    [Rarity.UNCOMMON]: 1.5,
    [Rarity.RARE]: 2,
    [Rarity.EPIC]: 3,
    [Rarity.UNIQUE]: 4,
    [Rarity.LEGENDARY]: 5,
  };

  return Math.floor(baseValue * quantity * (rarityMultiplier[rarity] || 1));
}

// Generar nombre dinámico para el Trade Good
function generateTradeGoodName(rarity: Rarity, material: string, quantity: number): string {
  const prefix = rarityPrefixes[rarity] || "Genérico";
  return `${prefix} ${material} (${quantity})`;
}
