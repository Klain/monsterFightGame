// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Character } from '../../../models/character/Characters';
import { SessionService } from '../../../services/sesion.service';
import { User } from '../../../models/User';
import { EffectInstance } from '../../../models/effects/EffectInstance';
import { DbItemsService } from '../../../services/dbItems.service';
import { ServerConfig , ActivityType } from '../../../models/ServerConfig';
import { ActivityManagerService } from '../../../services/activityManager.service';
import { CharacterListService } from '../../../services/characterList.service';
import { Combat } from '../../../models/actions/Combat';
import { Heist } from '../../../models/actions/Heist';
import { Upgrade } from '../../../models/upgrade';
import { Effects,Rarity,EquipPositionType } from '../../../models/ServerConfig'; 
import { ItemInstance } from '../../../models/inventory/items/instances/Item';
import { ItemDefinition } from '../../../models/inventory/items/definitions/ItemDefinition';
import { ItemInstanceConfig } from '../../../models/inventory/items/configurators/ItemConfigs';
import { ItemGenerator } from '../../../models/inventory/items/generator/ItemGenerator';
@Component({
  selector: 'debugger',
  templateUrl: './debugger.component.html',
  styleUrls: ['./debugger.component.css']
})
export class DebuggerComponent implements OnInit, OnDestroy {
  readonly Rarity=Rarity;
  user: User | null = null;
  character: Character | null = null;
  private userSub!: Subscription;
  private characterSub!: Subscription;

  instanceConfig: ItemInstanceConfig = {
    definition : this.dbItemsService.getItemById('1') as ItemDefinition,
    quantity : 1,
    price : 100,
    itemLevel : 1,
    rarity : 1,
    effectLevel : 1,
    durability : 1,
  };

  //-----FLAGS VISIBILIDAD----------
  mostrarMonedas:boolean = false;
  mostrarStatus:boolean = false;
  mostrarAtributos:boolean = false;
  mostrarMochila:boolean = false;
  mostrarEquipo:boolean = false;
  mostrarTienda:boolean = false;
  mostrarCiudad:boolean = false;
  mostrarTaberna:boolean = false;
  mostrarVoodoo:boolean = false;
  mostrarSantuario:boolean = false;
  mostrarExplorar:boolean = false;
  mostrarAsaltar:boolean = false;
  mostrarHerrero:boolean = false;
  mostrarEncantador:boolean = false;
  mostrarOtros:boolean = false;
  mostrarNewItem:boolean = false;

  constructor(
    private sessionService : SessionService,
    private dbItemsService : DbItemsService,
    public activityManagerService : ActivityManagerService,
    public characterListService : CharacterListService,
  ) {}

  ngOnInit(): void {
    this.characterListService.initialize(this.sessionService.firebaseService);
    this.userSub = this.sessionService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    });
    this.characterSub = this.sessionService.currentCharacter$.subscribe(character => {
      if(character){
        this.character = character;
        this.debugItemIndex = character.inventory.backpack.items.length;
      }
    });
  }


  //-----CURRENCIES----------
  addGold(){if(this.character){this.character.currencies.currentGold+=5;this.character?.save()}}
  addXp(){if(this.character){
    let aux = ServerConfig.xpToLevelUp(this.character.lvl+1);
    this.character.currencies.currentXp+=5;
    this.character.currencies.totalXp+=5;
    if(this.character.currencies.totalXp>=aux){
      this.character.lvl += 1;
    }
    this.character?.save()
  }}
  remGold(){if(this.character){this.character.currencies.currentGold-=5;this.character?.save()}}
  remXp(){if(this.character){this.character.currencies.currentXp-=5;this.character?.save()}}


  //-----STATS----------
  addCurrentHealth(){if(this.character){this.character.status.currentHealth+=5;this.character?.save()}}
  remCurrentHealth(){if(this.character){this.character.status.currentHealth-=5;this.character?.save()}}
  addTotalHealth(){if(this.character){this.character.status.totalHealth+=5;this.character?.save()}}
  remTotalHealth(){if(this.character){this.character.status.totalHealth-=5;this.character?.save()}}
  
  addCurrentStamina(){if(this.character){this.character.status.currentStamina+=5;this.character?.save()}}
  remCurrentStamina(){if(this.character){this.character.status.currentStamina-=5;this.character?.save()}}
  addTotalStamina(){if(this.character){this.character.status.totalStamina+=5;this.character?.save()}}
  remTotalStamina(){if(this.character){this.character.status.totalStamina-=5;this.character?.save()}}
  
  addCurrentMana(){if(this.character){this.character.status.currentMana+=5;this.character?.save()}}
  remCurrentMana(){if(this.character){this.character.status.currentMana-=5;this.character?.save()}}
  addTotalMana(){if(this.character){this.character.status.totalMana+=5;this.character?.save()}}
  remTotalMana(){if(this.character){this.character.status.totalMana-=5;this.character?.save()}}


  //-----ATTRIBUTOS----------
  subirFuerza(){
    if(this.character && this.character.attributes){
      this.character.attributes.strength += 1;
      this.character.attributes.save();
    }
  }


  //-----EQUIPO - INVENTARIO----------
  debugItemIndex: number=1;
  /* Buenisimo, pasamos una funcion flecha que recibe un parametro item al item grid 
  y este al item icon y en este componente ( itemIcon ) usa la funcion para obtener el string y mostrarlo
  De esta manera, desde la instanciacion del componente ItemGrid podemos indicar que queremos mostrar
  */
  equipItem = (item: ItemInstance, position : number): void => {
    if (item?.definition?.id && this.character?.inventory) {
      if(item.isEquipable()){
        this.character.inventory.backpack.removeItemByIndex(position);
        if(item.definition.EquipPositionType){
          this.character.inventory.equipItem(item, parseInt(EquipPositionType[item.definition.EquipPositionType]));
        }
      }else if(item.isUsable()){
        console.log("Objeto Usado!")
      }else{
        console.log("Objeto TRADEGOODS?")
      }
    }
  };
  unEquipItem = (item: ItemInstance, position : number): void => {
    if (item?.definition?.id) {
      if(item.isEquipable()){
        this.character?.inventory.unequipItem(position);
      }
    }
  };
  i(){ this.debugItemIndex += 1; }
  i2(){ this.debugItemIndex -= 1; }
  anadirPackDuales(){ if(this.character){
    this.instanceConfig.definition = this.dbItemsService.getItemById('5');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('146');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('156');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('136');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('137');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('138');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('141');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('142');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.instanceConfig.definition = this.dbItemsService.getItemById('143');
    this.character.inventory.backpack.addItem(new ItemInstance(this.instanceConfig));
    this.character.inventory.backpack.save();
  }}
  nuevoObjeto(){ if(this.character){this.i();this.character.inventory.addItemToBackpack(new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById(this.debugItemIndex.toString())}));}}
  anadirObjeto(){if(this.character){ this.character.inventory.addItemToBackpack(new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('1')}));}}
  anadirObjetoEffects(){ if(this.character){this.i();this.character.inventory.addItemToBackpack(new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById(this.debugItemIndex.toString()),effects:[new EffectInstance(1,1)]}));}}
  eliminarObjeto(){if(this.character){ this.i2();this.character.inventory.removeIndexFromBackpack(this.debugItemIndex);}}


  //-----MERCADER----------
  shopList=[
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('1'),price:100}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('2'),price:200}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('3'),price:300}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('4'),price:100}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('5'),price:200}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('6'),price:300}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('7'),price:100}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('8'),price:200}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('9'),price:300}),
    new ItemInstance({...this.instanceConfig, definition:this.dbItemsService.getItemById('10'),price:400}),

  ];
  /*ITEM SHOWABLE PROPERTIES*/
  precioCompra = (item: ItemInstance): string => { if (item) { return item.price.toString();  } else { return ""; } };
  precioVenta = (item: ItemInstance): string => { if (item) { 
    let aux = (ServerConfig.salePriceMultiplier * item.price).toString();
    return aux  } else { return ""; } };
  unidades = (item: ItemInstance): string => { if (item) { return item.quantity.toString();  } else { return ""; } };

  buyItem = (item: ItemInstance, position : number): void => {
    if (item) {
      if(this.character){
        if(this.character.currencies){
          if(this.character.currencies.currentGold 
            && this.character.currencies.currentGold >= item.price){
            this.character.currencies.currentGold -= item.price;
            this.character.inventory.addItemToBackpack(item);
            this.character.save();
          }
        }
        
      }
    }
  }
  sellItem = (item: ItemInstance, position : number): void => {
    if (item && position) {
      if(this.character){
        if(this.character.currencies){
          if(this.character.currencies.currentGold){
            this.character.currencies.currentGold += item.price*ServerConfig.salePriceMultiplier;
            this.character.inventory.removeIndexFromBackpack(position);
            this.character.save();
          }
        }
        
      }
    }
  }


  //-----ACCIONES----------
  activityResponseSuscribe: Subscription | undefined;
  activityResponse: string | String | null | undefined;
  iniciarActividad(actividad:ActivityType){
    if(this.character && this.character.activity.isActivityEnd){
      this.character.activity.startTime = Date.now();
      this.character.activity.durationInMs = 10000;
      this.character.activity.activityType = actividad;
      this.character.activity.isActivityEnd = false;
      this.activityManagerService.reset();
      this.character.activity.save();
      this.activityResponseSuscribe = this.activityManagerService.currentResponse$.subscribe({
        next:(response)=>{ 
          this.activityResponse = response;
        }
      });
    }
  }
  //-----TABERNA----------
  iniciarDescanso(){ this.iniciarActividad(ActivityType.TAVERN);}
  //-----VOODOO----------
  iniciarSanacion(){ this.iniciarActividad(ActivityType.VOODOO);}
  //-----SANTUARIO----------
  iniciarMeditacion(){ this.iniciarActividad(ActivityType.SANCTUARY);}
  //-----EXPLORACION----------
  iniciarExploracion(){ this.iniciarActividad(ActivityType.EXPLORE);}


  //-----ASALTO----------
  resultAsault=""
  enemyList: Character[] = [];
  buscarEnemigos(){
    if(this.character){
      this.characterListService.getCharacterList(this.character).then(
        (enemyList)=>{
          if(enemyList){
            this.resultAsault="";
            for(let enemy of enemyList){
              this.enemyList.push(Character.fromListJSON(enemy));
            }
          }
        }
      );
    }
    
  }
  asaltar(enemy:Character){
    let fullEnemy = undefined;
    this.characterListService.getEnemy(enemy).then(
      (result)=>{
        if(result){
          fullEnemy = Character.fromJSON(result,this.dbItemsService);
          fullEnemy.initialize(result.userUid,this.sessionService.firebaseService);
          this.resultAsault = Combat.engageCombat(this.character!,fullEnemy);
          this.character?.save();
          fullEnemy.save();
        }
        
      }
    );
  }
  robar(enemy:Character){
    let fullEnemy = undefined;
    this.characterListService.getEnemy(enemy).then(
      (result)=>{
        if(result){
          fullEnemy = Character.fromJSON(result, this.dbItemsService);
          fullEnemy.initialize(result.userUid,this.sessionService.firebaseService);
          this.resultAsault = Heist.attemptRobbery(this.character!,fullEnemy);
          this.character?.save();
          fullEnemy.save();
        }
        
      }
    );
  }
  espiar(enemy:Character){

  }

  //-----HERRERO----------
  getSmithableItems(): ItemInstance[] {
      return this.character?.inventory.backpack.items.filter(item => item instanceof ItemInstance) as ItemInstance[];
  }
  upgradeEquipLevel = (): void => {
    const equip = this.character?.inventory?.smith;
    if (equip) {
      equip.itemLevel+=1;
      equip.saveThis();
    }
  }
  upgradeEffectsNumber = (): void => {
    let equip = this.character?.inventory.smith;
    if(equip){
      const rarityValues = Object.values(Rarity).filter(value => typeof value === 'number') as number[];
      const currentRarityIndex = rarityValues.indexOf(equip.rarity);
      if (currentRarityIndex >= 0 && currentRarityIndex < rarityValues.length - 1) {
          equip.rarity = rarityValues[currentRarityIndex + 1] as Rarity;
          equip.saveThis();
      } else {
          console.warn('El equipo ya todos los nucleos posibles.');
      }
    }
  };
  upgradeEffectLevel = (): void => {
    const equip = this.character?.inventory?.smith;
    if (equip) {
      equip.effectLevel+=1;
      equip.saveThis();
    }
  };
  
  smithUpgrades: Upgrade[] = [
    {
        name: 'Refinar',
        level: () => this.character?.inventory?.smith?.itemLevel ?? 1,
        action: this.upgradeEquipLevel
    },
    {
        name: 'Nucleos',
        level: () => this.character?.inventory?.smith?.rarity ?? 0,
        action: this.upgradeEffectsNumber
    },
    {
        name: 'Conductividad',
        level: () => this.character?.inventory?.smith?.effectLevel ?? 0,
        action: this.upgradeEffectLevel
    },
    {
        name: 'Fundir',
        level: () => "",
        action: ()=>{}
    }
  ];
  seleccionar = (item: ItemInstance, position : number): void => {
    if (item && item.isSmithable()) {
      if(this.character){
        if(this.character.inventory.smith){
          this.character.inventory.switchItemToSmith(position);
        }else{
          this.character.inventory.addItemToSmith(position);  
        }
      }
    }
  }
  deseleccionar = (item: ItemInstance): void => {
    if (item) {
      if(this.character){
        this.character.inventory.removeItemFromSmith();
      }
    }
  }
  //-----ENCANTADOR----------

  setEffect = (equip: ItemInstance | undefined, effectId: number): void => { equip?.addEffect(new EffectInstance(effectId,1)); equip?.saveThis(); }
  disEnchant = (equip: ItemInstance | undefined, effectId: number): void => { 
    if(equip && equip.isEquipable()){
      let enchant = equip.effects!.filter(effect=>effect.effectId == effectId)[0];
      if(enchant){
        enchant = new EffectInstance(-1,0);
        equip.saveThis();  
      }
    }
  }
  isEffectUpgradeable(effectId:number):boolean{
    if(this.character && this.character.inventory.enchant){
      let item = this.character.inventory.enchant;
      if(item && item.isEnchantable()){
        return ((item.effects!.filter(( effect : EffectInstance) =>effect?.effectId==effectId).length>0) || item.hasEmptySlot());
      }
    }
    return false;
  }
  enchantEffects: Upgrade[] = (() => {
    const upgrades: Upgrade[] = [];
    const effectKeys = Object.keys(Effects).filter(key => isNaN(Number(key)));
    for (let i = 0; i < effectKeys.length; i++) {
      const enchant = this.character?.inventory?.enchant ?? undefined;
      if(enchant && enchant.isEnchantable()){
        const level = (enchant.effects!.find((effect:EffectInstance) => effect?.effectId === i)?.effectLevel ?? 0 ).toString()
        upgrades.push({
          name: effectKeys[i], 
          level: () => level,
          action: () => { this.setEffect(enchant, i); }
        });
      }
    }
    return upgrades;
  })();
  

  setItemToEnchant = (item: ItemInstance, position : number): void => {
    if (this.character && item && item.isEnchantable()) {
      if(this.character.inventory.enchant){
        this.character.inventory.switchItemToEnchant(position);
      }else{
        this.character.inventory.addItemToEnchant(position);  
      }
    }
  }
  unsetItemToEnchant = (item: ItemInstance): void => {
    if (this.character && item) {
      this.character.inventory.removeItemFromEnchant();
    }
  }


  //-----OTROS----------
  crearNewItem(){
    let itemInstace = undefined;
    if(this.character){
      itemInstace = ItemGenerator.newItem(this.character,{})
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.characterSub) { this.characterSub.unsubscribe(); }
    if(this.activityResponseSuscribe){ this.activityResponseSuscribe.unsubscribe(); }
  }
}