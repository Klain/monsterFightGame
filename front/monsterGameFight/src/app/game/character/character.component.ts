import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { CharacterAttributesComponent } from "../../shared/character-attributes/character-attributes.component";
import { InventoryComponent } from "../../shared/inventory/inventory.component";

@Component({
  selector: "app-character",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CharacterAttributesComponent,
    InventoryComponent,
  ],
  templateUrl: "./character.component.html",
  styleUrls: ["./character.component.css"], 
})
export class CharacterComponent {}
