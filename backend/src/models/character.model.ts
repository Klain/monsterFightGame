import { ActivityType, StatusEffect } from "../constants/enums";
import CacheDataService from "../services/cache/CacheDataService";
import { Activity } from "./activity.model";
import { ActivityReward } from "./activityReward.model";
import { CharacterStatus } from "./characterStatus.model";
import { Friendship } from "./friendship.model";
import { Inventory } from "./inventory.model";
import { ItemDefinition } from "./itemDefinition.model";
import { ItemInstance } from "./itemInstance.model";
import { Message } from "./message.model";
import { User } from "./user.model";
export class Character {
  private _id: number = 0;
  private _userId: number = 0;
  private _name: string = "";
  private _faction: string = "";
  private _class: number = 1;
  private _level: number = 1;
  //ATRIBUTES
  private _strength: number = 1;
  private _endurance: number = 1;
  private _constitution: number = 1;
  private _precision: number = 1;
  private _agility: number = 1;
  private _vigor: number = 1;
  private _spirit: number = 1;
  private _willpower: number = 1;
  private _arcane: number = 1;
  //
  private _currentHealth: number = 100;
  private _totalHealth: number = 100;
  private _currentStamina: number = 100;
  private _totalStamina: number = 100;
  private _currentMana: number = 100;
  private _totalMana: number = 100;

  private _currentXp: number = 0;
  private _totalXp: number = 0;
  private _currentGold: number = 0;
  private _totalGold: number = 0;
  private _upgradePoints: number = 0;

  private _goldChest: number = 0;
  private _warehouse: number = 0;
  private _enviroment: number = 0;
  private _traps: number = 0;

  private _lastFight?: Date;

  private _statuses: CharacterStatus[] = [];
  private _inventory:Inventory = new Inventory();
  private _activities: Activity[] = [];
  private _friendships: Friendship[] = [];

  constructor(data: any) {
    Object.assign(this, data);
  }
  
  //Equipo
  static async getEquippedStats(id:number){
  }
  equipItem(itemId: number): void {
    this._inventory.items = this._inventory.items.map((ci) =>
      ci.itemId === itemId ? new ItemInstance({ ...ci, equipped: true }) : ci
    );
    CacheDataService.updateInventory(this._id, this._inventory.items);
  }
  unequipItem(itemId: number): void {
    this._inventory.items = this._inventory.items.map((ci) =>
      ci.itemId === itemId ? new ItemInstance({ ...ci, equipped: false }) : ci
    );
    CacheDataService.updateInventory(this._id, this._inventory.items);
  }

  //Actividades
  async startActivity(activityType: ActivityType, duration: number): Promise<Activity | null> {
    const newActivity = new Activity({
      characterId: this._id,
      type: activityType,
      startTime: new Date(),
      duration: duration,
      completed: false,
    });
    const newActivityCreated = await CacheDataService.createActivity(newActivity);
    this.activities.push(newActivityCreated);
    return newActivityCreated;
  }
  getActivityStatus(): Activity | null {
    return this.activities.find(activity => !activity.completed) || null;
  }
  async claimActivityReward(): Promise <boolean> {
    const rewards: ActivityReward = Activity.calculateActivityReward(this.activities[0].type, this.activities[0].duration);
    this.currentXp += rewards.xp ?? 0;
    this.currentGold += rewards.gold ?? 0;
    this.currentHealth = Math.min(this.totalHealth, this.currentHealth + (rewards.health ?? 0) - (rewards.costHealth ?? 0));
    this.currentStamina = Math.min(this.totalStamina, this.currentStamina + (rewards.stamina ?? 0) - (rewards.costStamina ?? 0));
    this.currentMana = Math.min(this.totalMana, this.currentMana + (rewards.mana ?? 0) - (rewards.costMana ?? 0));
    this.activities[0].completed = true;
    return await CacheDataService.deleteActivity(this.activities[0])
  }

  //Shop
  buyItem(item: ItemDefinition): void {
    const existingItem = this._inventory.items.find(i => i.itemId === item.id);
    if (existingItem) {
      existingItem.stock += 1;
    } else {
      const newItem = new ItemInstance({
        characterId: this._id,
        itemId: item.id,
        equipped: false,
        stock: 1,
      });
      this._inventory.items.push(newItem);
    }
    this.currentGold -= item.price;
    CacheDataService.updateCharacter(this);
    CacheDataService.updateInventory(this._id, this._inventory.items);
  }
  sellItem(itemId: number): void {
    const item = CacheDataService.getItemDefinitionById(itemId);
    this._inventory.items = this._inventory.items.filter((ci) => ci.itemId !== itemId);
    this.currentGold += item!.price;
  }

  //Friends
  getFriends():{id:number,username:string}[]{
    const friendships = CacheDataService.getUserFriendships(this.id);
    let friends: User[] = [];
    friendships.forEach(friendship=>{
      const friendId = friendship.idUser1==this.id? friendship.idUser2: friendship.idUser1;
      const friend = CacheDataService.getUserById(friendId);
      if(friend){
        friends.push(friend);
      }
    });
    return friends.map(friend=> {return {id:friend.id,username:friend.username} });
  }
  async sendFriendRequest(userId:number): Promise<boolean>{
    const result = await CacheDataService.createFriendship({
      id:0,
      idUser1:this.id,
      idUser2:userId,
      active:false,
    });
    return result;
  }
  acceptFriendship(friendship:Friendship){
    friendship.active=true;
    CacheDataService.updateFriendship(friendship);
  }
  async deleteFriendship(friendhip:Friendship):Promise<boolean>{
    const result = await CacheDataService.deleteFriendship(friendhip);
    return result;
  }


  calculateUpgradeCost(attributeValue: number): number {
    return 100 + attributeValue * 10;
  }
  getHealthPercentage(): number {
    return (this.currentHealth / this.totalHealth) * 100;
  }
  isDead(): boolean {
    return this.currentHealth <= 0;
  }
  calculateDamage(target: Character): number {
    // Probabilidad de evasión
    const evasionChance = target.agility / (this.precision + target.agility);
    if (Math.random() < evasionChance) {
      return 0; // Golpe evadido
    }

    // Daño físico
    let damage = Math.max(this.strength - target.endurance / 2, 1);

    // Probabilidad de crítico
    const critChance = this.precision / (this.precision + target.agility);
    if (Math.random() < critChance) {
      damage = Math.floor(damage * 1.5); // Crítico
    }

    return damage;
  }

  // OUTPUTS AL FRONT
  wsr():any{
    return{
      name: this.name,
      faction: this.faction,
      class: this.class,
      level: this.level,
      ...this.wsrAttributes(),
      ...this.wsrAttributesUpgradeCost(),
      ...this.wsrStatus(),
      ...this.wsrCurrencies(),
      ...this.wsrLair(),
      ...this.wsrLairCost(),
      ...this.wsrActivitiesDuration(),
      ...this.wsrActivities(),
      ...this.wsrInventory(),
      ...this.wsrFriendship(),
    }
  }
  wsrAttributes():any{
    return {
      attributes:{
        strength: this.strength,
        endurance: this.endurance,
        constitution: this.constitution,
        precision: this.precision,
        agility: this.agility,
        vigor: this.vigor,
        spirit: this.spirit,
        willpower: this.willpower,
        arcane: this.arcane,
      }
    }
  }
  wsrAttributesUpgradeCost():any{
    return {
      attributesUpgradeCost:{
        strength: this.calculateUpgradeCost(this.strength),
        endurance: this.calculateUpgradeCost(this.endurance),
        constitution: this.calculateUpgradeCost(this.constitution),
        precision: this.calculateUpgradeCost(this.precision),
        agility: this.calculateUpgradeCost(this.agility),
        vigor: this.calculateUpgradeCost(this.vigor),
        spirit: this.calculateUpgradeCost(this.spirit),
        willpower: this.calculateUpgradeCost(this.willpower),
        arcane: this.calculateUpgradeCost(this.arcane),
      }
    }
  }
  wsrStatus():any{
    return {
      status:{
        currentHealth: Math.floor(this.currentHealth),
        totalHealth:Math.floor( this.totalHealth),
        currentStamina: Math.floor(this.currentStamina),
        totalStamina: Math.floor(this.totalStamina),
        currentMana: Math.floor(this.currentMana),
        totalMana: Math.floor(this.totalMana),
      }
    }
  }
  wsrCurrencies():any{
    return {
      currencies:{
        currentXp: Math.floor(this.currentXp),
        totalXp: Math.floor(this.totalXp),
        currentGold: Math.floor(this.currentGold),
        totalGold: Math.floor(this.totalGold),
        upgradePoints: Math.floor(this.upgradePoints),
      }
    }
  }
  wsrLair():any{
    return{
      lair: {
        goldChest: this.goldChest,
        warehouse : this.warehouse,
        enviroment : this.enviroment,
        traps : this.traps
      }
    }
  }
  wsrLairCost():any{
    return {
      lairCost:{
        goldChest: this.calculateUpgradeCost(this.goldChest),
        warehouse: this.calculateUpgradeCost(this.warehouse),
        enviroment: this.calculateUpgradeCost(this.enviroment),
        traps: this.calculateUpgradeCost(this.traps),
      }
    }
  }
  wsrActivitiesDuration(): any {
    const maxActivityDuration = {
      [ActivityType.EXPLORE] : Math.floor(this.exploracionMaxDuration()),
      [ActivityType.HEAL] : Math.floor(this.sanarMaxDuration()),
      [ActivityType.REST] : Math.floor(this.descansarMaxDuration()),
      [ActivityType.MEDITATE] : Math.floor(this.meditarMaxDuration()),
    };
  
    return {
      maxActivityDuration:maxActivityDuration,
    };
  }
  wsrActivities(): any {
    return this.activities[0]?.wsr() || {};
  }
  wsrInventory():any{
    return this.inventory.wsr()
  }
  wsrFriendship():any{
    return {
      friendships:{
        friends: this.friendships.filter(
            friendship=>friendship.active==true
            ).map(
              friendship=>{
                const friendId = friendship.idUser1 == this.userId ? friendship.idUser2 : friendship.idUser1;
                const name = CacheDataService.getUserById(friendId)?.username;
                if(!friendId && !name){return;}
                return { id:friendId , name : name }
                }),
        request: this.friendships.filter(
          friendship=>friendship.active==false
          ).map(
            friendship=>{
              const friendId = friendship.idUser1 == this.userId ? friendship.idUser2 : friendship.idUser1;
              const name = CacheDataService.getUserById(friendId)?.username;
              if(!friendId && !name){return;}
              return { id:friendId , name : name }
              }),
      }
    }
  }


  exploracionMaxDuration(){ return this.currentStamina }
  sanarMaxDuration(){ return (this.totalHealth-this.currentHealth)*1 }
  descansarMaxDuration(){ return (this.totalStamina-this.currentStamina)*1 }
  meditarMaxDuration(){ return (this.totalMana-this.currentMana)*1 }


  // MENSAJERIA
  sendMessage(message: Message):void{ CacheDataService.createMessage(message); }
  getMessages(characterId: number): Message[] { return CacheDataService.getMessagesByCharacterId(characterId); }
  getCountMessages(characterId: number): number { return CacheDataService.getMessagesByCharacterId(characterId).length; }
  markMessageAsRead(messageId: number): void{ CacheDataService.markMessageAsRead(messageId); }
  deleteMessage(message: Message): void { CacheDataService.deleteMessage(message); }
  getMessageById(messageId: number): Message | null { return CacheDataService.getMessageById(messageId); }


  // GETTERS Y SETTERS
  private updateCharacter(): void { CacheDataService.updateCharacter(this); }
  private updateInventory():void { CacheDataService.updateInventory(this._id, this._inventory.items); }

  get id() { return this._id; }
  set id(value: number) { this._id = value; this.updateCharacter(); }

  get userId() { return this._userId; }
  set userId(value: number) { this._userId = value; this.updateCharacter(); }

  get name() { return this._name; }
  set name(value: string) { this._name = value; this.updateCharacter(); }

  get faction() { return this._faction; }
  set faction(value: string) { this._faction = value; this.updateCharacter(); }

  get class() { return this._class; }
  set class(value: number) { this._class = value; this.updateCharacter(); }

  get level() { return this._level; }
  set level(value: number) { this._level = value; this.updateCharacter(); }

  get strength() { return this._strength; }
  set strength(value: number) { this._strength = value; this.updateCharacter(); }

  get endurance() { return this._endurance; }
  set endurance(value: number) { this._endurance = value; this.updateCharacter(); }

  get constitution() { return this._constitution; }
  set constitution(value: number) { this._constitution = value; this.updateCharacter(); }

  get precision() { return this._precision; }
  set precision(value: number) { this._precision = value; this.updateCharacter(); }

  get agility() { return this._agility; }
  set agility(value: number) { this._agility = value; this.updateCharacter(); }

  get vigor() { return this._vigor; }
  set vigor(value: number) { this._vigor = value; this.updateCharacter(); }

  get spirit() { return this._spirit; }
  set spirit(value: number) { this._spirit = value; this.updateCharacter(); }

  get willpower() { return this._willpower; }
  set willpower(value: number) { this._willpower = value; this.updateCharacter(); }

  get arcane() { return this._arcane; }
  set arcane(value: number) { this._arcane = value; this.updateCharacter(); }

  get currentHealth() { return this._currentHealth; }
  set currentHealth(value: number) { this._currentHealth = value; this.updateCharacter(); }

  get totalHealth() { return this._totalHealth; }
  set totalHealth(value: number) { this._totalHealth = value; this.updateCharacter(); }

  get currentStamina() { return this._currentStamina; }
  set currentStamina(value: number) { this._currentStamina = value; this.updateCharacter(); }

  get totalStamina() { return this._totalStamina; }
  set totalStamina(value: number) { this._totalStamina = value; this.updateCharacter(); }

  get currentMana() { return this._currentMana; }
  set currentMana(value: number) { this._currentMana = value; this.updateCharacter(); }

  get totalMana() { return this._totalMana; }
  set totalMana(value: number) { this._totalMana = value; this.updateCharacter(); }

  get statuses() { return this._statuses; }
  set statuses(value: CharacterStatus[]) { this._statuses = value; this.updateCharacter(); }

  get inventory() { return this._inventory; }
  set inventory(value: Inventory) { this._inventory = value; this.updateInventory(); }

  get currentXp() { return this._currentXp; }
  set currentXp(value: number) {
    this._totalXp += value - this._currentXp;
    this._currentXp = value; 
    this.updateCharacter(); 
  }
  get totalXp() { return this._totalXp; }


  get currentGold() { return this._currentGold; }
  set currentGold(value: number) { 
    this._totalGold += value - this._currentGold;
    this._currentGold = value; 
    this.updateCharacter(); 
  }

  get totalGold() { return this._totalGold; }

  get upgradePoints() { return this._upgradePoints; }
  set upgradePoints(value: number) { this._upgradePoints = value; this.updateCharacter(); }

  get goldChest() { return this._goldChest; }
  set goldChest(value: number) { this._goldChest = value; this.updateCharacter(); }

  get warehouse() { return this._warehouse; }
  set warehouse(value: number) { this._warehouse = value; this.updateCharacter(); }

  get enviroment() { return this._enviroment; }
  set enviroment(value: number) { this._enviroment = value; this.updateCharacter(); }

  get traps() { return this._traps; }
  set traps(value: number) { this._traps = value; this.updateCharacter(); }

  get activities(): Activity[] { return this._activities; }
  set activities(value: Activity[]) { this._activities = value; this.updateCharacter(); }

  get friendships(): Friendship[] { return this._friendships; }
  set friendships(value: Friendship[]) { this._friendships = value; this.updateCharacter(); }

  get lastFight() { return this._lastFight; }
  set lastFight(value: Date | undefined) { this._lastFight = value; this.updateCharacter(); }
}
