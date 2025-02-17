import { ArmorMaterialType, EquipPositionType, EquipType, ItemType, Rarity, WeaponFamily } from "../../constants/enums";

export class Item {
  id: number = 0;
  name: string = "";

  itemType: ItemType = ItemType.TRADEGOODS;
  equipType?: EquipType;
  equipPositionType?: EquipPositionType;
  weaponFamily?: WeaponFamily;
  armorMaterialType?: ArmorMaterialType;

  rarity: Rarity = Rarity.COMMON;
  levelRequired: number = 1;
  price: number = 0;

  // Bonificaciones que otorga el objeto
  bonuses: {
    strength?: number;
    endurance?: number;
    constitution?: number;
    precision?: number;
    agility?: number;
    vigor?: number;
    spirit?: number;
    willpower?: number;
    arcane?: number;
    health?: number;
    stamina?: number;
    mana?: number;
  } = {};
  effects?: string[] = [];

  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }

  // Método para verificar si un personaje puede usar el objeto
  canBeUsedBy(characterLevel: number): boolean {
    return characterLevel >= this.levelRequired;
  }

  /**
   * Función estática para convertir datos de la base de datos en una instancia de Item
   * @param data - Los datos obtenidos de la base de datos (fila)
   * @returns Instancia de Item
   */
  static parseDB(data: {
    id: number;
    name: string;
    itemType: number;
    equipType?: number | null;
    equipPositionType?: number | null;
    weaponFamily?: number | null;
    armorMaterialType?: number | null;
    rarity: number;
    levelRequired: number;
    price: number;
    bonuses: string;
    effects: string;
  }): Item {
    return new Item({
      id: data.id,
      name: data.name,
      itemType: data.itemType as ItemType,
      equipType: data.equipType ?? undefined,
      equipPositionType: data.equipPositionType ?? undefined,
      weaponFamily: data.weaponFamily ?? undefined,
      armorMaterialType: data.armorMaterialType ?? undefined,
      rarity: data.rarity as Rarity,
      levelRequired: data.levelRequired,
      price: data.price,
      bonuses: JSON.parse(data.bonuses), // Parsear JSON de bonificaciones
      effects: JSON.parse(data.effects), // Parsear JSON de efectos
    });
  }
}
