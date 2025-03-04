import { Activity } from "./activity.model";
import { CharacterStatus } from "./characterStatus.model";
import { Inventory } from "./inventory.model";
import { ActivityType, CharacterClass } from "../constants/enums";
import CacheDataService from "../services/cache/CacheDataService";

export class Character {
  readonly id: number = 0;
  readonly userId: number = 0;
  name: string = "";
  faction: string = "";
  class: CharacterClass = 1;
  level: number = 1;
  //ATRIBUTES
  strength: number = 1;
  endurance: number = 1;
  constitution: number = 1;
  precision: number = 1;
  agility: number = 1;
  vigor: number = 1;
  spirit: number = 1;
  willpower: number = 1;
  arcane: number = 1;
  //
  currentHealth: number = 100;
  totalHealth: number = 100;
  currentStamina: number = 100;
  totalStamina: number = 100;
  currentMana: number = 100;
  totalMana: number = 100;

  currentXp: number = 0;
  totalXp: number = 0;
  currentGold: number = 0;
  totalGold: number = 0;
  upgradePoints: number = 0;

  goldChest: number = 0;
  warehouse: number = 0;
  environment: number = 0;
  traps: number = 0;

  lastFight?: Date;

  statuses: CharacterStatus[] = [];
  inventory : Inventory = new Inventory(); 
  friendships : number[] = []; //Guardamos solo los idFriendship y los obtenemos de cacheFriendship
  activities : number[] = []; //Guardamos solo los idActivity y los obtenemos de cacheActivities
  messages : number[]=[];//Guardamos solo los idMessage y los obtenemos de cacheMessages

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
    return CacheDataService.cacheActivities.get(this.activities[0]??0) || null
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
        environment: this.environment,
        traps: this.traps,
      },
    };
  }
  wsrLairCost(): any {
    return {
      lairCost: {
        goldChest: this.calculateUpgradeCost(this.goldChest),
        warehouse: this.calculateUpgradeCost(this.warehouse),
        environment: this.calculateUpgradeCost(this.environment),
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
    const activity = CacheDataService.cacheActivities.get(this.activities[0]??0) || null;
    if(activity){
      return activity.wsr() 
    }
    return { activity: null };
  }
  wsrInventory():any{
    return this.inventory.wsr()
  }
  wsrFriendship(): any {
    const friendshipList =  CacheDataService.getUserFriendships(this.userId);
    return {
      friendships: {
        friends: friendshipList
          .filter(friendship => friendship.active)
          .map(friendship => {
            const friendId = friendship.idUser1 === this.userId ? friendship.idUser2 : friendship.idUser1;
            const name = CacheDataService.getUserById(friendId)?.username || "Desconocido";
            return { id: friendId, name };
          }),
        request: friendshipList
          .filter(friendship => !friendship.active)
          .map(friendship => {
            const friendId = friendship.idUser1 === this.userId ? friendship.idUser2 : friendship.idUser1;
            const name = CacheDataService.getUserById(friendId)?.username || "Desconocido";
            return { id: friendId, name };
          }),
      },
    };
  }
  toLeaderboardCharacter(): LeaderboardCharacter {
    return {
      id: this.id,
      name: this.name,
      faction: this.faction,
      class: this.class,
      level: this.level,
      totalGold: this.totalGold,
      isFriend: false,
      canSendRequest: false,
      isOwnCharacter:false,
    };
  }

  getFriendshipData(): FriendshipListResponse {
  
    const userId = this.userId;
    const friendships = CacheDataService.getUserFriendships(userId);

    const friends :FriendshipResponse[] = [];
    const incomingRequests:FriendshipResponse[] = [];
    const outgoingRequests:FriendshipResponse[] = [];

    friendships.forEach(f => {
      const isRecipient = f.idUser2 === userId;
      const friendId = isRecipient ? f.idUser1 : f.idUser2;
      const friendUser = CacheDataService.getUserById(friendId);
      
      const friendshipData = {
        friendshipId: f.id, 
        username: friendUser?.username || "Desconocido",
        active: f.active
      };

      if (f.active) {
        friends.push(friendshipData);
      } else if (isRecipient) {
        incomingRequests.push(friendshipData);
      } else {
        outgoingRequests.push(friendshipData);
      }
    });

    return { friends, incomingRequests, outgoingRequests };
  }  
}


export interface FriendshipListResponse {
   friends: FriendshipResponse[], 
   incomingRequests: FriendshipResponse[], 
   outgoingRequests: FriendshipResponse[] 
  }
export interface FriendshipResponse {
  friendshipId:number,
  username:string,
  active:boolean
}

export interface LeaderboardCharacter {
  id: number;
  name: string;
  faction: string;
  class: number;
  level: number;
  totalGold: number;
  isFriend: boolean;
  canSendRequest: boolean;
  isOwnCharacter :boolean;
}

