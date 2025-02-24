import {  Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";

import { ShopComponent } from "../../shared/shop/shop.component";
import { ShopService } from "../../core/services/shop.service";
import { Character, Item } from "../../core/models/character.models";
import { CharacterService } from "../../core/services/character.service";

@Component({
  selector: "app-shop-display",
  standalone: true,
  imports: [CommonModule, ShopComponent],
  templateUrl: "./shop-display.component.html",
  styleUrls: ["./shop-display.component.scss"],
})
export class ShopDisplayComponent implements OnInit {
  shopList:Item[]=[];
  character$: Observable<Character | null>;
  character!:Character;

  constructor(
    private characterService : CharacterService,
    private shopService: ShopService,
  ) {
    this.character$ = this.characterService.character$;
    this.character$.subscribe({
      next:(character)=>{
        if(character){
          this.character = character;
        }
      },
      error:()=>{}
    });
  }

  ngOnInit(){    
    this.loadShopItems();
  }

  loadShopItems() {
    this.shopService.getShopItems().subscribe((items: Item[]) => {
      this.shopList = items.sort((a, b) => a.levelRequired - b.levelRequired);
    });
  }

   /*ITEM SHOWABLE PROPERTIES*/
   precioCompra = (item: Item): string => { if (item) { return item.priceBuy.toString();  } else { return ""; } };
   precioVenta = (item: Item): string => { if (item) {  return item.priceSell.toString() } else { return ""; }}
   unidades = (item: Item): string => { if (item) { return item.stock.toString();  } else { return ""; } };
   buyItem = (item: Item, position : number): void => {
     if (item && this.character) {
       this.shopService.buyItem(item.id??0).subscribe(() => this.loadShopItems());
     }
   }
   sellItem = (item: Item, position : number): void => {
     if (item && this.character) {
        this.shopService.sellItem(item.id??0).subscribe(() => this.loadShopItems());
     }
   }
}
