//front\src\app\shared\item-icon\item-icon.component.ts
import { Component, Input, OnInit, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconTooltipComponent } from '../Item-icon-tooltip/item-icon-tooltip.component';
import { Item } from '../../core/models/character.models';
import { formatMoney } from '../../core/pipes/format-money';
import { EquipPositionType, EquipType } from '../../core/constants/enums';

@Component({
  selector: 'ItemIcon',
  standalone:true,
  templateUrl: './item-icon.component.html',
  styleUrls: ['./item-icon.component.css'],
  imports:[
    CommonModule,
    formatMoney,
    ItemIconTooltipComponent,
  ]
})
export class ItemIconComponent implements OnInit , OnChanges  {
  public readonly EquipType = EquipType;

  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() topLeft?: (...args: any[]) => any;
  @Input() topRight?: (...args: any[]) => any;
  @Input() bottomLeft?: (...args: any[]) => any;
  @Input() bottomRight?: (...args: any[]) => String;
  @Input() item?: Item;
  @Input() leftClick?: (...args: any[]) => any;
  @Input() rightClick?: (...args: any[]) => any;
  @Input() index : number = -1;
  //@ViewChild('tooltip') tooltip!: ItemIconTooltipComponent;

  constructor(
   ) {}
  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) { 
      this.item = changes['item'].currentValue;
    }
    if (changes['height'] && changes['height'].currentValue) {this.height=changes['height'].currentValue}
    if (changes['width'] && changes['width'].currentValue) {this.width=changes['width'].currentValue}
    if (changes['topLeft'] && changes['topLeft'].currentValue) {this.topLeft=changes['topLeft'].currentValue}
    if (changes['topRight'] && changes['topRight'].currentValue) {this.topRight=changes['topRight'].currentValue}
    if (changes['bottomLeft'] && changes['bottomLeft'].currentValue) {this.bottomLeft=changes['bottomLeft'].currentValue}
    if (changes['bottomRight'] && changes['bottomRight'].currentValue) {this.bottomRight=changes['bottomRight'].currentValue}
    if (changes['leftClick'] && changes['leftClick'].currentValue) {this.leftClick=changes['leftClick'].currentValue}
    if (changes['rightClick'] && changes['rightClick'].currentValue) {this.rightClick=changes['rightClick'].currentValue}
    if (changes['index'] && changes['index'].currentValue) {this.index=changes['index'].currentValue}
  }

  get backgroundImage(): string {
    return 'assets/drawable/ui/icons/backgrounds/icon_rarity_common.png';
  }

  get itemIcon(): string {
    if (!this.item || !this.item.equipPositionType) {
      return 'assets/drawable/icon_empty.png';
    }
    const iconBasePath = 'assets/drawable/ui/icons/';
      const equipIcons: Record<number, string> = {
      [EquipPositionType.HEAD]: 'armor/icon_armor_leather_head.png',
      [EquipPositionType.CHEST]: 'armor/icon_armor_leather_chest.png',
      [EquipPositionType.SHOULDER]: 'armor/icon_armor_leather_shoulders.png',
      [EquipPositionType.WRIST]: 'armor/icon_armor_leather_wrist.png',
      [EquipPositionType.LEGS]: 'armor/icon_armor_leather_legs.png',
      [EquipPositionType.NECKLACE]: 'armor/icon_armor_amulet.png',
      [EquipPositionType.RING1]: 'armor/icon_armor_ring.png',
      [EquipPositionType.RING2]: 'armor/icon_armor_ring.png', 
      [EquipPositionType.HANDS]: 'armor/icon_armor_leather_hands.png',
      [EquipPositionType.WAIST]: 'armor/icon_armor_leather_waist.png',
      [EquipPositionType.FEET]: 'armor/icon_armor_leather_feets.png',
      [EquipPositionType.BACK]: 'armor/icon_armor_leather_cloak.png',
      [EquipPositionType.TRINKET1]: 'armor/icon_armor_trinket.png',
      [EquipPositionType.TRINKET2]: 'armor/icon_armor_trinket.png',
      [EquipPositionType.MAINHAND]: 'weapon/icon_weapon_axe.png', 
      [EquipPositionType.OFFHAND]: 'weapon/icon_weapon_axe.png', 
    };
    return `${iconBasePath}${equipIcons[this.item.equipPositionType] || 'icon_empty.png'}`;
  }
  
  get frameIcon(): string {
    return 'assets/drawable/ui/icons/frames/icon_frame_1.png';
  }

  onLeftClick(event: MouseEvent) { 
    if (this.leftClick) {
      this.leftClick(this.item, this.index);
    } else {
      //this.showTooltip(event);
    }
  }
  onRightClick(event: MouseEvent) {
    event.preventDefault(); 
    if (this.rightClick) {
      this.rightClick(this.item, this.index);
    } else if (!this.leftClick) {
      //this.showTooltip(event);
    }
  }
  showTooltip(event: MouseEvent): void {
    const x = event.clientX;
    const y = event.clientY + 20;
    //this.tooltip.show(x, y);
  }

  isEquipable(): boolean {
    return (this.item?.equipType?true:false);
  }
}