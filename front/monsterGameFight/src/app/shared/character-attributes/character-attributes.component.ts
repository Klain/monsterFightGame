import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { CharacterService } from '../../core/services/character.service';
import { Observable, forkJoin } from 'rxjs';
import { Character } from '../../core/models/chacter.models';
import { validAttributes } from '../../core/constants/attributes';

@Component({
  selector: 'app-character-attributes',
  standalone: true,
  templateUrl: './character-attributes.component.html',
  styleUrls: ['./character-attributes.component.css'],
  imports: [CommonModule, MatCardModule, MatGridListModule, MatButtonModule]
})
export class CharacterAttributesComponent implements OnInit {
  character$: Observable<Character | null>;
  attributeCosts: { [key: string]: number } = {};
  isLoading: { [key: string]: boolean } = {};

  // Lista de atributos a mejorar (cargada dinámicamente)
  attributeList = validAttributes.map(attr => ({ label: this.formatLabel(attr), key: attr }));

  constructor(private characterService: CharacterService, private snackBar: MatSnackBar) {
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
    this.loadUpgradeCosts();
  }

  loadUpgradeCosts() {
    const requests = validAttributes.map(attr => this.characterService.getUpgradeCost(attr));
    
    forkJoin(requests).subscribe((costsArray: any[]) => {
      this.attributeCosts = costsArray.reduce((acc, cost) => {
        acc[cost.attribute] = cost.cost;
        return acc;
      }, {} as { [key: string]: number });
    });
  }

  upgradeAttribute(attribute: string) {
    if (this.isLoading[attribute]) return;
    
    this.isLoading[attribute] = true;

    this.characterService.upgradeAttribute(attribute).subscribe({
      next: () => {
        this.showToast(`Has mejorado ${this.formatLabel(attribute)}!`, "success");
        this.loadUpgradeCosts(); // Refrescar costos después de mejorar
      },
      error: () => this.showToast("No tienes suficiente XP para mejorar este atributo.", "error"),
      complete: () => this.isLoading[attribute] = false
    });
  }

 
  showToast(message: string, type: "success" | "error" | "info") {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      panelClass: type === "success" ? "toast-success" : "toast-error"
    });
  }

  private formatLabel(attribute: string): string {
    return attribute.charAt(0).toUpperCase() + attribute.slice(1);
  }
}
