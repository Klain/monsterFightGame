import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CharacterService } from '../../core/services/character.service';
import { Observable, forkJoin, map } from 'rxjs';
import { Character } from '../../core/models/chacter.models';

@Component({
  selector: 'app-character-attributes',
  standalone: true,
  templateUrl: './character-attributes.component.html',
  styleUrls: ['./character-attributes.component.css'],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule]
})
export class CharacterAttributesComponent implements OnInit {
  character$: Observable<Character | null>;
  attributeCosts: { [key: string]: number } = {};
  isLoading: { [key: string]: boolean } = { attack: false, defense: false, health: false };

  constructor(private characterService: CharacterService, private snackBar: MatSnackBar) {
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
    this.loadUpgradeCosts();
  }

  loadUpgradeCosts() {
    const attributes = ['attack', 'defense', 'health'];
    const requests = attributes.map(attr => this.characterService.getUpgradeCost(attr));

    forkJoin(requests).subscribe(costsArray => {
      this.attributeCosts = costsArray.reduce((acc, cost) => {
        acc[cost.attribute] = cost.cost;
        return acc;
      }, {} as { [key: string]: number });
    });
  }

  upgradeAttribute(attribute: string) {
    this.isLoading[attribute] = true;

    this.characterService.upgradeAttribute(attribute).subscribe({
      next: () => {
        this.showToast(`Has mejorado ${attribute}!`, "success");
        this.loadUpgradeCosts();
      },
      error: () => this.showToast("No tienes suficiente XP para mejorar este atributo.", "error"),
      complete: () => {
        this.isLoading[attribute] = false;
      }
    });
  }

  
  train() {
    this.characterService.startTraining(1).subscribe({
      next: () => this.showToast("Entrenamiento iniciado!", "success"),
      error: () => this.showToast("Error al iniciar entrenamiento.", "error")
    });
  }

  heal() {
    this.characterService.startHealing().subscribe({
      next: () => this.showToast("Sanación iniciada!", "success"),
      error: () => this.showToast("Error al iniciar sanación.", "error")
    });
  }

  findOpponent() {
    this.characterService.findOpponent().subscribe({
      next: opponent => this.showToast(`Encontraste un oponente: ${opponent.name}`, "info"),
      error: () => this.showToast("Error al buscar oponente.", "error")
    });
  }

  showToast(message: string, type: "success" | "error" | "info") {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      panelClass: type === "success" ? "toast-success" : "toast-error"
    });
  }
}
