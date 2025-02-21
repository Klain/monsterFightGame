export class User {
    id: number=0;
    username: string="";
    password:string="";
    last_online:Date=new Date();

    constructor(data: Partial<User>) {
        Object.assign(this, data);
      }
}
  