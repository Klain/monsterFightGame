//backend\src\utils\itemGenerators\weapon.generator.utils.ts
import { ItemDefinition } from "../../models/itemDefinition.model";
import { Rarity, ItemType, EquipType, EquipPositionType, WeaponFamily, WeaponType } from "../../constants/enums";
import { calculatePrice, generateWeaponName, rollRarity, rollWeaponFamily, rollWeaponType } from "./common.generator.utils";

// Generador Procedural de Armas
export function generateWeapon(level: number): ItemDefinition {
    // Determinar la rareza basada en probabilidades
    const rarity = rollRarity([
      { rarity: Rarity.COMMON, chance: 70 },
      { rarity: Rarity.UNCOMMON, chance: 20 },
      { rarity: Rarity.RARE, chance: 8 },
      { rarity: Rarity.LEGENDARY, chance: 2 },
    ]);
  
    // Seleccionar una familia de armas
    const weaponFamily = rollWeaponFamily();
  
    // Seleccionar un tipo de arma dentro de la familia
    const weaponType = rollWeaponType(weaponFamily);
  
    // Determinar bonificaciones principales según la familia
    const bonuses = calculateBonuses(level, weaponFamily);
  
    // Construir el arma
    return new ItemDefinition({
      id: Date.now(), // ID único basado en la hora
      name: generateWeaponName(rarity, weaponFamily), // Nombre dinámico
      itemType: ItemType.EQUIPMENT,
      equipType: EquipType.WEAPON,
      equipPositionType: EquipPositionType.MAINHAND,
      weaponFamily: weaponFamily,
      rarity: rarity,
      levelRequired: level,
      price: calculatePrice(bonuses, rarity), // Ajustar con la rareza
      bonuses, // Incluir todos los bonificadores
    });
  }
  
// Determinar bonificaciones ofensivas basadas en la familia y el nivel
function calculateBonuses(level: number, family: WeaponFamily): Record<string, number> {
  let strength = 0;
  let agility = 0;
  let precision = 0;
  let spirit = 0;

  switch (family) {
    case WeaponFamily.FIST:
    case WeaponFamily.SWORD:
    case WeaponFamily.AXE:
    case WeaponFamily.MACE:
      // Bonificaciones cuerpo a cuerpo
      strength = Math.floor(Math.random() * (level * 2) + 5);
      agility = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    case WeaponFamily.BOW:
    case WeaponFamily.CROSSBOW:
    case WeaponFamily.THROWING:
      // Bonificaciones a distancia
      precision = Math.floor(Math.random() * (level * 2) + 5);
      agility = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    case WeaponFamily.RELIC:
    case WeaponFamily.FOCUS:
    case WeaponFamily.GRIMOIRE:
      // Bonificaciones mágicas
      spirit = Math.floor(Math.random() * (level * 2) + 5);
      precision = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    case WeaponFamily.LANCE:
    case WeaponFamily.GUNPOWDER:
      // Bonificaciones híbridas
      strength = Math.floor(Math.random() * (level * 2) + 5);
      precision = Math.random() > 0.5 ? Math.floor(Math.random() * level + 3) : 0;
      break;

    default:
      // Default a armas genéricas
      strength = Math.floor(Math.random() * (level * 2) + 5);
      break;
  }

  return {
    strength,
    agility,
    precision,
    spirit,
  };
}
  




