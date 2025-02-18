import { StatusEffect } from "../constants/enums";
import { CharacterStatus } from "./characterStatus.model";
import { Inventory } from "./inventory.model";

 //backend\src\models\character.ts
 export class Character {
  id: number = 0;
  userId: number = 0;
  name: string = "";
  faction: string = "";
  class: number = 1;
  level: number = 1;

  strength: number = 1;
  endurance: number = 1;
  constitution: number = 1;
  precision: number = 1;
  agility: number = 1;
  vigor: number = 1;
  spirit: number = 1;
  willpower: number = 1;
  arcane: number = 1;

  currentHealth: number = 100;
  totalHealth: number = 100;
  currentStamina: number = 100;
  totalStamina: number = 100;
  currentMana: number = 100;
  totalMana: number = 100;

  statuses: CharacterStatus[] = [];
  inventory:Inventory = new Inventory();

  characterId: number = 0;
  currentXp: number = 0;
  totalXp: number = 0;
  currentGold: number = 0;
  totalGold: number = 0;

  upgradePoints: number = 0;
  lastFight?: Date;

  constructor(data: Partial<Character>) {
    Object.assign(this, data);
  }

  calculateUpgradeCost(attributeValue: number): number {
    return 100 + attributeValue * 10;
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.totalHealth) * 100;
  }
  
  // Método para calcular el nivel basado en la experiencia total
  getLevelFromXp(): number {
    return Math.floor(this.totalXp / 1000);
  }

  // Método para verificar si tiene suficiente oro
  hasEnoughGold(amount: number): boolean {
    return this.currentGold >= amount;
  }

  // Aplica daño al personaje
  receiveDamage(damage: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
  }

  // Verifica si el personaje está muerto
  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  // Calcula daño infligido a otro personaje
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

  // Añade experiencia y oro al personaje
  addRewards(xp: number, gold: number): void {
    this.currentXp += xp;
    this.currentGold += gold;
  }

  // Reduce el oro del personaje
  deductGold(amount: number): void {
    this.currentGold = Math.max(0, this.currentGold - amount);
  }

  // Método para añadir un estado
  addStatus(status: CharacterStatus): void {
    this.statuses.push(status);
  }

  // Método para eliminar un estado
  removeStatus(effect: StatusEffect): void {
    this.statuses = this.statuses.filter(status => status.type !== effect);
  }

  // Método para reducir la duración de los estados
  reduceStatusDurations(): void {
    this.statuses = this.statuses
      .map(status => ({
        ...status,
        duration: status.duration - 1,
      }))
      .filter(status => status.duration > 0); // Eliminar estados con duración 0
  }

  // Método para comprobar si un estado está activo
  hasStatus(effect: StatusEffect): boolean {
    return this.statuses.some(status => status.type === effect);
  }

  wsr():any{
    return{
      name: this.name,
      faction: this.faction,
      class: this.class,
      level: this.level,
      ...this.wsrAttributes(),
      ...this.wsrAttributesUpgradeCost(),
      ...this.wsrCurrencies(),
      ...this.wsrStatus(),
      ...this.wsrActivitiesDuration(),
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
  wsrActivitiesDuration(): any {
    const maxActivityDuration = [
      0,
      Math.floor(this.exploracionMaxDuration()),
      Math.floor(this.sanarMaxDuration()),
      Math.floor(this.descansarMaxDuration()),
      Math.floor(this.meditarMaxDuration()),
     ];
  
    return {
      maxActivityDuration:maxActivityDuration,
    };
  }

  exploracionMaxDuration(){ return this.currentStamina }
  sanarMaxDuration(){ return (this.totalHealth-this.currentHealth)*1 }
  descansarMaxDuration(){ return (this.totalStamina-this.currentStamina)*1 }
  meditarMaxDuration(){ return (this.totalMana-this.currentMana)*1 }
  
}
