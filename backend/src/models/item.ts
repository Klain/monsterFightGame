//backend\src\models\item.ts
export class ItemDefinition {
    private _id : string;
    private _name : string;
    private _goldBuy : number;
    private _extraCurrencyBuy : number;
    private _goldSell : number;
    private _strength : number;
    private _defense : number;
    private _agility : number;
    private _stamina :  number;
    private _dexterity : number;
    
    private _hitChanceBase : number;
    private _hitChanceBonus : number;
    private _hitChanceBaseEnemy : number;
    private _hitChanceBonusEnemy : number;
    private _damageBasic : number;
    private _damageBonus : number;
    private _damageBasicEnemy : number;
    private _damageBonusEnemy : number;
    private _hpBonus : number;
    private _levelCap: number;
 }