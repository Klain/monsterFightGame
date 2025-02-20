export class ItemEffect {
    itemId: number = 0;
    effectId: number = 0;
    value: number = 0;
  
    constructor(data: Partial<ItemEffect>) {
      Object.assign(this, data);
    }
  }
  