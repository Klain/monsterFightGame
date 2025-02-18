export class Effect {
    id: number = 0;
    name: string = "";
  
    constructor(data: Partial<Effect>) {
      Object.assign(this, data);
    }
  }
  