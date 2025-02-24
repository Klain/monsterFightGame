//src\app\components\common\Item-Grid-display\ItemGrid.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Character,Item } from '../../core/models/character.models';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from '../item-icon/item-icon.component';

@Component({
  selector: 'ItemGrid',
  standalone:true,
  templateUrl: './item-grid.component.html',
  styleUrls: ['./item-grid.component.css'],
  imports:[
    CommonModule,
    ItemIconComponent
  ]
})
export class ItemGridComponent implements  OnChanges {
  @Input() rows: number = 3;
  @Input() cols: number = 3;
  @Input() height: string = '64px';
  @Input() width: string = '64px';
  
  @Input() topLeft?: (...args: any[]) => any;
  @Input() topRight?: (...args: any[]) => any;
  @Input() bottomLeft?: (...args: any[]) => any;
  @Input() bottomRight?: (...args: any[]) => any;

  @Input() character? : Character = undefined;
  @Input() shopList? : Array<Item> = [];
  @Input() smithItems? : Array<Item> = [];

  @Input() action1?: (...args: any[]) => any;
  @Input() action2?: (...args: any[]) => any;

  @Input() filter?: (...args: any[]) => any;

  debugItemIndex: number=0;
  itemList: (Item | null)[] = [];

  constructor(    
    ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['character'] && changes['character'].currentValue) {
      this.character = changes['character'].currentValue;
      if (this.character?.backpack) {
        this.itemList = [];
        for (let i = 0; i < (this.rows * this.cols); i++) {
          this.itemList.push(this.character.backpack[i] || null);
        }
      }
    }else if (changes['shopList'] && changes['shopList'].currentValue){
      this.shopList = changes['shopList'].currentValue;
      if (this.shopList) {
        this.itemList = [];
        for (let i = 0; i < (this.rows * this.cols); i++) {
          this.itemList.push(this.shopList[i] || null);
        }
      }
    }else if(changes['smithItems'] && changes['smithItems'].currentValue){
      let smithItems = changes['smithItems'].currentValue;
      if(Array.isArray(smithItems)){
        this.itemList = [];
        for (let i = 0; i < (this.rows * this.cols); i++) {
          this.itemList.push(smithItems[i] || null);
        }
      }
    }
    if (changes['rows'] && changes['rows'].currentValue) {this.rows=changes['rows'].currentValue}
    if (changes['cols'] && changes['cols'].currentValue) {this.cols=changes['cols'].currentValue}
    if (changes['height'] && changes['height'].currentValue) {this.height=changes['height'].currentValue}
    if (changes['width'] && changes['width'].currentValue) {this.width=changes['width'].currentValue}
    if (changes['topLeft'] && changes['topLeft'].currentValue) {this.topLeft=changes['topLeft'].currentValue}
    if (changes['topRight'] && changes['topRight'].currentValue) {this.topRight=changes['topRight'].currentValue}
    if (changes['bottomLeft'] && changes['bottomLeft'].currentValue) {this.bottomLeft=changes['bottomLeft'].currentValue}
    if (changes['bottomRight'] && changes['bottomRight'].currentValue) {this.bottomRight=changes['bottomRight'].currentValue}
    if (changes['action1'] && changes['action1'].currentValue) {this.action1=changes['action1'].currentValue}
    if (changes['action2'] && changes['action2'].currentValue) {this.action2=changes['action2'].currentValue}
  }
}