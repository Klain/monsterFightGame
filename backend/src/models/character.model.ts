import { Activity } from "./activity.model";
import { CharacterStatus } from "./characterStatus.model";
import { Friendship } from "./friendship.model";
import { Inventory } from "./inventory.model";
import { CharacterService } from "../services/character.service";
import { ActivityType } from "../constants/enums";
import CacheDataService from "../services/cache/CacheDataService";
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
  inventory : Inventory = new Inventory();
  friendships : Friendship[] = [];
  activities : Activity[] = [];

  constructor(data: any) {
    Object.assign(this, data);
  }

  exploracionMaxDuration(){ return this.currentStamina }
  sanarMaxDuration(){ return (this.totalHealth-this.currentHealth)*1 }
  descansarMaxDuration(){ return (this.totalStamina-this.currentStamina)*1 }
  meditarMaxDuration(){ return (this.totalMana-this.currentMana)*1 }
  calculateUpgradeCost(attributeValue: number): number {
    return 100 + attributeValue * 10;
  }
  getActivityStatus(): Activity | null {
    return this.activities.find(activity => !activity.isComplete()) || null;
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

  // OUTPUTS AL FRONTEND
  wsr(): any {
    return {
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
      ...this.wsrInventory(), // Inventario ajustado a Map<number, Item[]>
      ...this.wsrFriendship(),
      lastFight: this.lastFight,
    };
  }
  wsrAttributes(): any {
    return {
      attributes: {
        strength: this.strength,
        endurance: this.endurance,
        constitution: this.constitution,
        precision: this.precision,
        agility: this.agility,
        vigor: this.vigor,
        spirit: this.spirit,
        willpower: this.willpower,
        arcane: this.arcane,
      },
    };
  }
  wsrAttributesUpgradeCost(): any {
    return {
      attributesUpgradeCost: {
        strength: this.calculateUpgradeCost(this.strength),
        endurance: this.calculateUpgradeCost(this.endurance),
        constitution: this.calculateUpgradeCost(this.constitution),
        precision: this.calculateUpgradeCost(this.precision),
        agility: this.calculateUpgradeCost(this.agility),
        vigor: this.calculateUpgradeCost(this.vigor),
        spirit: this.calculateUpgradeCost(this.spirit),
        willpower: this.calculateUpgradeCost(this.willpower),
        arcane: this.calculateUpgradeCost(this.arcane),
      },
    };
  }
  wsrStatus(): any {
    return {
      status: {
        currentHealth: Math.floor(this.currentHealth),
        totalHealth: Math.floor(this.totalHealth),
        currentStamina: Math.floor(this.currentStamina),
        totalStamina: Math.floor(this.totalStamina),
        currentMana: Math.floor(this.currentMana),
        totalMana: Math.floor(this.totalMana),
      },
    };
  }
  wsrCurrencies(): any {
    return {
      currencies: {
        currentXp: Math.floor(this.currentXp),
        totalXp: Math.floor(this.totalXp),
        currentGold: Math.floor(this.currentGold),
        totalGold: Math.floor(this.totalGold),
        upgradePoints: Math.floor(this.upgradePoints),
      },
    };
  }
  wsrLair(): any {
    return {
      lair: {
        goldChest: this.goldChest,
        warehouse: this.warehouse,
        enviroment: this.enviroment,
        traps: this.traps,
      },
    };
  }
  wsrLairCost(): any {
    return {
      lairCost: {
        goldChest: this.calculateUpgradeCost(this.goldChest),
        warehouse: this.calculateUpgradeCost(this.warehouse),
        enviroment: this.calculateUpgradeCost(this.enviroment),
        traps: this.calculateUpgradeCost(this.traps),
      },
    };
  }
  wsrActivitiesDuration(): any {
    return {
      maxActivityDuration: {
        [ActivityType.EXPLORE]: Math.floor(this.exploracionMaxDuration()),
        [ActivityType.HEAL]: Math.floor(this.sanarMaxDuration()),
        [ActivityType.REST]: Math.floor(this.descansarMaxDuration()),
        [ActivityType.MEDITATE]: Math.floor(this.meditarMaxDuration()),
      },
    };
  }
  wsrActivities(): any {
    return this.activities[0]?.wsr() || { activity: null };
  }
  wsrInventory():any{
    return this.inventory.wsr()
  }
  wsrFriendship(): any {
    return {
      friendships: {
        friends: this.friendships
          .filter(friendship => friendship.active)
          .map(friendship => {
            const friendId = friendship.idUser1 === this.userId ? friendship.idUser2 : friendship.idUser1;
            const name = CacheDataService.getUserById(friendId)?.username || "Desconocido";
            return { id: friendId, name };
          }),
        request: this.friendships
          .filter(friendship => !friendship.active)
          .map(friendship => {
            const friendId = friendship.idUser1 === this.userId ? friendship.idUser2 : friendship.idUser1;
            const name = CacheDataService.getUserById(friendId)?.username || "Desconocido";
            return { id: friendId, name };
          }),
      },
    };
  }

  
  get id() { return this._id; }
  set id(value: number) { this._id = value; CharacterService.updateCharacter(this); }

  get userId() { return this._userId; }
  set userId(value: number) { this._userId = value; CharacterService.updateCharacter(this); }

  get name() { return this._name; }
  set name(value: string) { this._name = value; CharacterService.updateCharacter(this); }

  get faction() { return this._faction; }
  set faction(value: string) { this._faction = value; CharacterService.updateCharacter(this); }

  get class() { return this._class; }
  set class(value: number) { this._class = value; CharacterService.updateCharacter(this); }

  get level() { return this._level; }
  set level(value: number) { this._level = value; CharacterService.updateCharacter(this); }

  get strength() { return this._strength; }
  set strength(value: number) { this._strength = value; CharacterService.updateCharacter(this); }

  get endurance() { return this._endurance; }
  set endurance(value: number) { this._endurance = value; CharacterService.updateCharacter(this); }

  get constitution() { return this._constitution; }
  set constitution(value: number) { this._constitution = value; CharacterService.updateCharacter(this); }

  get precision() { return this._precision; }
  set precision(value: number) { this._precision = value; CharacterService.updateCharacter(this); }

  get agility() { return this._agility; }
  set agility(value: number) { this._agility = value; CharacterService.updateCharacter(this); }

  get vigor() { return this._vigor; }
  set vigor(value: number) { this._vigor = value; CharacterService.updateCharacter(this); }

  get spirit() { return this._spirit; }
  set spirit(value: number) { this._spirit = value; CharacterService.updateCharacter(this); }

  get willpower() { return this._willpower; }
  set willpower(value: number) { this._willpower = value; CharacterService.updateCharacter(this); }

  get arcane() { return this._arcane; }
  set arcane(value: number) { this._arcane = value; CharacterService.updateCharacter(this); }

  get currentHealth() { return this._currentHealth; }
  set currentHealth(value: number) { this._currentHealth = value; CharacterService.updateCharacter(this); }

  get totalHealth() { return this._totalHealth; }
  set totalHealth(value: number) { this._totalHealth = value; CharacterService.updateCharacter(this); }

  get currentStamina() { return this._currentStamina; }
  set currentStamina(value: number) { this._currentStamina = value; CharacterService.updateCharacter(this); }

  get totalStamina() { return this._totalStamina; }
  set totalStamina(value: number) { this._totalStamina = value; CharacterService.updateCharacter(this); }

  get currentMana() { return this._currentMana; }
  set currentMana(value: number) { this._currentMana = value; CharacterService.updateCharacter(this); }

  get totalMana() { return this._totalMana; }
  set totalMana(value: number) { this._totalMana = value; CharacterService.updateCharacter(this); }

  get statuses() { return this._statuses; }
  set statuses(value: CharacterStatus[]) { this._statuses = value; CharacterService.updateCharacter(this); }

  get currentXp() { return this._currentXp; }
  set currentXp(value: number) {
    this._totalXp += value - this._currentXp;
    this._currentXp = value; 
    CharacterService.updateCharacter(this); 
  }
  get totalXp() { return this._totalXp; }

  get currentGold() { return this._currentGold; }
  set currentGold(value: number) { 
    this._totalGold += value - this._currentGold;
    this._currentGold = value; 
    CharacterService.updateCharacter(this); 
  }

  get totalGold() { return this._totalGold; }

  get upgradePoints() { return this._upgradePoints; }
  set upgradePoints(value: number) { this._upgradePoints = value; CharacterService.updateCharacter(this); }

  get goldChest() { return this._goldChest; }
  set goldChest(value: number) { this._goldChest = value; CharacterService.updateCharacter(this); }

  get warehouse() { return this._warehouse; }
  set warehouse(value: number) { this._warehouse = value; CharacterService.updateCharacter(this); }

  get enviroment() { return this._enviroment; }
  set enviroment(value: number) { this._enviroment = value; CharacterService.updateCharacter(this); }

  get traps() { return this._traps; }
  set traps(value: number) { this._traps = value; CharacterService.updateCharacter(this); }

  get lastFight() { return this._lastFight; }
  set lastFight(value: Date | undefined) { this._lastFight = value; CharacterService.updateCharacter(this); }
}
