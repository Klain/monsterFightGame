//front\src\app\shared\item-icon\item-icon.component.ts
import { Component, Input, OnInit, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconTooltipComponent } from '../Item-icon-tooltip/item-icon-tooltip.component';
import { Item } from '../../core/models/character.models';
import { formatMoney } from '../../core/pipes/format-money';
import { EquipType } from '../../core/constants/enums';

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
    if(this.item){
      return 'assets/drawable/ui/icons/weapon/icon_weapon_gunpowder.png';
    }else{
      return 'assets/drawable/icon_empty.png';
    }
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