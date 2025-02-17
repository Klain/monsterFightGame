import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { CharacterAttributesComponent } from "../../shared/character-attributes/character-attributes.component";
import { InventoryComponent } from "../../shared/inventory/inventory.component";
import { CharacterService } from "../../core/services/character.service";
import { Observable } from "rxjs";
import { Character } from "../../core/models/chacter.models";
import { ItemGridComponent } from "../../shared/Item-Grid-display/ItemGrid.component";

@Component({
  selector: "app-character",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CharacterAttributesComponent,
    InventoryComponent,
    ItemGridComponent
  ],
  templateUrl: "./character.component.html",
  styleUrls: ["./character.component.css"], 
})
export class CharacterComponent {
  character$: Observable<Character | null>;
  character!:Character;

  constructor(
    private characterService:CharacterService
  ){
    this.character$ = this.characterService.character$;
    this.character$.subscribe({
      next:(chacter)=>{
        if(chacter){
          this.character=chacter;
        }
      },
      error:()=>{}
    });
  }

}
