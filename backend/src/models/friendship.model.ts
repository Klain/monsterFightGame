export class Friendship {
    id:number=0;
    idUser1: number = 0;
    idUser2: number = 0;
    active : boolean = false;
  
    constructor(data: Partial<Friendship>) {
      Object.assign(this, data);
    }
  }
  