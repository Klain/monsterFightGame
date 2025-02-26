import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { CharacterAttributesComponent } from "../../shared/character-attributes/character-attributes.component";
import { CharacterService } from "../../core/services/character.service";
import { Observable } from "rxjs";
import { Character, Item } from "../../core/models/character.models";
import { ItemGridComponent } from "../../shared/item-grid/item-grid.component";
import { ItemEquipmentComponent } from "../../shared/item-equipment/item-equipment.component";
import { InventoryService } from "src/app/core/services/inventory.service";
import { unidades } from "src/app/shared/utils";

@Component({
  selector: "app-character",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CharacterAttributesComponent,
    ItemEquipmentComponent,
    ItemGridComponent
  ],
  templateUrl: "./character.component.html",
  styleUrls: ["./character.component.css"], 
})
export class CharacterComponent {
  character$: Observable<Character | null>;
  character!:Character;
  unidades=unidades;

  constructor(
    private characterService : CharacterService,
    private inventoryService : InventoryService,
  ){
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

  equipItem = (item: Item, position: number): void => {
    if (item && this.character) {
      this.inventoryService.equipItem(item.id ?? 0).subscribe();
    }
  };
  
  unequipItem = (item: Item, position: number): void => {
      if (item && this.character) {
          this.inventoryService.unequipItem(item.id ?? 0).subscribe();
      }
  };
}
