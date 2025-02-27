// src\app\components\common\Item-Equipment-display\ItemEquipment.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipPositionType } from '../../core/constants/enums';
import { Character } from '../../core/models/character.models';
import { ItemIconComponent } from '../item-icon/item-icon.component';

@Component({
  selector: 'ItemEquipment',
  standalone:true,
  templateUrl: './item-equipment.component.html',
  styleUrls: ['./item-equipment.component.css'],
  imports: [
    CommonModule,
    ItemIconComponent
  ]
})
export class ItemEquipmentComponent  implements OnChanges{
  readonly EquipPositionType = EquipPositionType;

  @Input() character!: Character;
  @Input() height: string = '64px';
  @Input() width: string = '64px';
  @Input() topLeft?: (...args: any[]) => any;
  @Input() topRight?: (...args: any[]) => any;
  @Input() bottomLeft?: (...args: any[]) => any;
  @Input() bottomRight?: (...args: any[]) => any;

  @Input() action1?: (...args: any[]) => any;
  @Input() action2?: (...args: any[]) => any;

  constructor(
  ){

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['character'] && changes['character'].currentValue) {
      this.character = changes['character'].currentValue;
    }
    if (changes['height'] && changes['height'].currentValue) {this.height=changes['height'].currentValue}
    if (changes['width'] && changes['width'].currentValue) {this.width=changes['width'].currentValue}
    if (changes['topLeft'] && changes['topLeft'].currentValue) {this.topLeft=changes['topLeft'].currentValue}
    if (changes['topRight'] && changes['topRight'].currentValue) {this.topRight=changes['topRight'].currentValue}
    if (changes['bottomLeft'] && changes['bottomLeft'].currentValue) {this.bottomLeft=changes['bottomLeft'].currentValue}
    if (changes['bottomRight'] && changes['bottomRight'].currentValue) {this.bottomRight=changes['bottomRight'].currentValue}
    if (changes['action1'] && changes['action1'].currentValue) {this.action1=changes['action1'].currentValue}
    if (changes['action2'] && changes['action2'].currentValue) {this.action2=changes['action2'].currentValue}
  }
  getItemType(index:number):string{
    switch(index+1){
      case 1: return 'equipIcon HEAD';break;
      case 3: return 'equipIcon CHEST';break;
      case 4: return 'equipIcon SHOULDER';break;
      case 5: return 'equipIcon WRIST';break;
      case 8: return 'equipIcon LEGS';break;
      case 2: return 'equipIcon NECKLACE';break;
      case 11: return 'equipIcon RING1';break;
      case 12: return 'equipIcon RING2';break;
      case 6: return 'equipIcon HANDS';break;
      case 7: return 'equipIcon WAIST';break;
      case 9: return 'equipIcon FEET';break;
      case 10: return 'equipIcon BACK';break;
      case 13: return 'equipIcon TRINKET1';break;
      case 14: return 'equipIcon TRINKET2';break;                     
      case 15: return 'equipIcon MAINHAND';break;
      case 16: return 'equipIcon OFFHAND';break;
      default: return '';break;
    }
  }

}