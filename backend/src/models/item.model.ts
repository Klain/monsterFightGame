import { EquipPositionType, EquipType, ItemType, EffectType } from "../constants/enums";

export class Item {
  id: number = 0;
  name: string = "";
  itemType: ItemType = ItemType.TRADEGOODS;
  equipType?: EquipType;
  equipPositionType?: EquipPositionType;
  levelRequired: number = 1;
  price: number = 0;

  // Bonificaciones que otorga el objeto (dinámico según los efectos asignados)
  bonuses: Record<string, number> = {}; // Almacenará { "STRENGTH": 10, "AGILITY": 5, ... }

  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }

  canBeUsedBy(characterLevel: number): boolean {
    return characterLevel >= this.levelRequired;
  }

  /**
   * Función estática para convertir datos de la base de datos en una instancia de Item
   * @param data - Datos obtenidos de la base de datos (fila de `items`)
   * @param effects - Efectos obtenidos de `items_effects`
   * @returns Instancia de Item
   */
  static parseDB(
    data: {
      id: number;
      name: string;
      itemType: number;
      equipType?: number | null;
      equipPositionType?: number | null;
      levelRequired: number;
      price: number;
    },
    effects: { effect_name: string; value: number }[] 
  ): Item {
    const bonuses: Record<string, number> = {};

    effects.forEach(({ effect_name, value }) => {
      bonuses[effect_name] = value;
    });

    return new Item({
      id: data.id,
      name: data.name,
      itemType: data.itemType as ItemType,
      equipType: data.equipType ?? undefined,
      equipPositionType: data.equipPositionType ?? undefined,
      levelRequired: data.levelRequired,
      price: data.price,
      bonuses,
    });
  }
}
