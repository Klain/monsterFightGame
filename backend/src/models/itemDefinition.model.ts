import { EquipPositionType, EquipType, ItemType, WeaponType } from "../constants/enums";

export class ItemDefinition {
  readonly id: number = 0;
  readonly name: string = "";
  readonly itemType: ItemType = ItemType.TRADEGOODS;
  readonly equipType?: EquipType;
  readonly equipPositionType?: EquipPositionType;
  readonly equipWeaponType?: WeaponType;
  readonly levelRequired: number = 1;
  readonly price: number = 0;
  readonly effects : {effectId:number , value:number}[] = []
  readonly imageUrl : string = "";

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
