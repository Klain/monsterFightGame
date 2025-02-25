//front\src\app\shared\item-grid\item-grid.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Character, Item } from '../../core/models/character.models';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from '../item-icon/item-icon.component';

@Component({
  selector: 'ItemGrid',
  standalone: true,
  templateUrl: './item-grid.component.html',
  styleUrls: ['./item-grid.component.css'],
  imports: [
    CommonModule,
    ItemIconComponent
  ]
})
export class ItemGridComponent implements OnChanges {
  @Input() rows: number = 3;
  @Input() cols: number = 3;
  @Input() height: string = '64px';
  @Input() width: string = '64px';

  @Input() topLeft?: (...args: any[]) => any;
  @Input() topRight?: (...args: any[]) => any;
  @Input() bottomLeft?: (...args: any[]) => any;
  @Input() bottomRight?: (...args: any[]) => any;

  @Input() character?: Character = undefined;
  @Input() shopList?: Array<Item> = [];
  @Input() smithItems?: Array<Item> = [];

  @Input() action1?: (...args: any[]) => any;
  @Input() action2?: (...args: any[]) => any;

  @Input() filter?: (...args: any[]) => any;

  debugItemIndex: number = 0;
  itemList: (Item | null)[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['character'] && changes['character'].currentValue) {
      this.character = changes['character'].currentValue;
      this.processCharacterInventory();
    } else if (changes['shopList'] && changes['shopList'].currentValue) {
      this.processShopItems();
    } else if (changes['smithItems'] && changes['smithItems'].currentValue) {
      this.processSmithItems();
    }

    // Actualizar otros valores si han cambiado
    this.syncInputChanges(changes);
  }

  private processCharacterInventory() {
    this.itemList = [];
    if (this.character?.backpack) {
      // 🔥 Extraer los ítems desde el objeto `backpack`
      const flatBackpack = Object.values(this.character.backpack).flat(); 
      
      // Rellenar la cuadrícula con los ítems o `null` si hay menos ítems de los necesarios
      for (let i = 0; i < (this.rows * this.cols); i++) {
        this.itemList.push(flatBackpack[i] || null);
      }
    }
  }

  private processShopItems() {
    this.itemList = [];
    for (let i = 0; i < (this.rows * this.cols); i++) {
      this.itemList.push(this.shopList?.[i] || null);
    }
  }

  private processSmithItems() {
    this.itemList = [];
    if (Array.isArray(this.smithItems)) {
      for (let i = 0; i < (this.rows * this.cols); i++) {
        this.itemList.push(this.smithItems[i] || null);
      }
    }
  }

  private syncInputChanges(changes: SimpleChanges) {
    const properties = ['rows', 'cols', 'height', 'width', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'action1', 'action2'];
    properties.forEach(prop => {
      if (changes[prop] && changes[prop].currentValue !== undefined) {
        (this as any)[prop] = changes[prop].currentValue;
      }
    });
  }
}
