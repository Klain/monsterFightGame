import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CharacterService } from '../../core/services/character.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, MatCardModule, MatButtonModule]
})
export class DashboardComponent implements OnInit {
  character: any = {};  // Datos del personaje

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.loadCharacter(); // Cargar personaje al iniciar
  }

  loadCharacter() {
    this.characterService.getCharacter().subscribe(data => {
      this.character = data;
    });
  }

  train() {
    this.characterService.startTraining().subscribe(() => {
      alert("Entrenamiento iniciado!");
      this.loadCharacter(); // Recargar datos
    });
  }

  heal() {
    this.characterService.startHealing().subscribe(() => {
      alert("Sanación iniciada!");
      this.loadCharacter();
    });
  }

  findOpponent() {
    this.characterService.findOpponent().subscribe(opponent => {
      alert(`Encontraste un oponente: ${opponent.name}`);
    });
  }
}
