export class Friendship {
    readonly id:number=0;
    readonly idUser1: number = 0;
    readonly idUser2: number = 0;
    active : boolean = false;
  
    constructor(data: Partial<Friendship>) {
      Object.assign(this, data);
    }
  }
  