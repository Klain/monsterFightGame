import { EquipPositionType, EquipType, ItemType, EffectType } from "../constants/enums";
import { Effect } from "./effect.model";
import { ItemEffect } from "./itemEffect.model";

export class ItemDefinition {
  id: number = 0;
  name: string = "";
  itemType: ItemType = ItemType.TRADEGOODS;
  equipType?: EquipType;
  equipPositionType?: EquipPositionType;
  levelRequired: number = 1;
  price: number = 0;
  effects : {effectId:number , value:number}[] = []

  constructor(data: Partial<ItemDefinition>) {
    Object.assign(this, data);
  }

  wsr(){
    return {
      ...this,
      priceBuy: this.price,
      priceSell: this.price/2
    }
  }

  canBeUsedBy(characterLevel: number): boolean {
    return characterLevel >= this.levelRequired;
  }
}
