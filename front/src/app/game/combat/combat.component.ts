import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../core/services/combat.service';
import { Opponent, CombatResult, HeistLog } from '../../core/interfaces/combat.interfaces';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.css'],
}) 
export class CombatComponent {
  mode: 'search' | 'actions' = 'search'; 
  opponents: Opponent[] = [];
  combatLog: CombatResult | null = null;
  heistLog: HeistLog | null = null;
  searching = false; 
  combatCost = 10; 
  selectedAction: string | null = null; 
  showLog = false; 

  actions = [
    {name:'Asaltar',onClick: (name:string)=>{this.searchOpponents(name)}}, 
    {name:'Robar',onClick: (name:string)=>{this.searchOpponents(name)}}, 
    {name:'Espiar',onClick: (name:string)=>{this.searchOpponents(name)}}
  ]; 


  constructor(private combatService: CombatService) {}

  // Alterna entre modos
  switchMode(mode: 'search' | 'actions'): void {
    this.mode = mode;
    this.resetResults();
  }

  // Inicia la búsqueda de oponentes
  searchOpponents(action: string | null): void {
    this.selectedAction = action;
    this.searching = true;
    this.combatService.searchOpponents().subscribe({
      next: (response: { opponents: Opponent[] }) => {
        this.opponents = response.opponents || [];
        this.searching = false; // Asegúrate de desactivar el estado de búsqueda
      },
      error: (err: any) => {
        console.error('Error al buscar oponentes:', err);
        this.searching = false;
      },
    });
  }
  

  // Ejecuta una acción de combate
  performAction(action: string, opponentId: number): void {
    this.selectedAction = action;
    this.showLog = true;

    if (action === 'Asaltar') {
      this.combatService.startAssault(opponentId).subscribe({
        next: (result:CombatResult) => {
          this.combatLog = result;
        },
        error: (err:any) => {
          console.error('Error al iniciar el asalto:', err);
        },
      });
    } else if (action === 'Robar') {
      this.combatService.startHeist(opponentId).subscribe({
        next: (log:HeistLog) => {
          this.heistLog = log;
        },
        error: (err:any) => {
          console.error('Error al intentar el robo:', err);
        },
      });
    } else if (action === 'Espiar') {
      console.log('Espiar aún no implementado.');
    }
  }

  // Resetea los resultados
  resetResults(): void {
    this.opponents = [];
    this.combatLog = null;
    this.heistLog = null;
    this.showLog = false;
    this.selectedAction = null;
    this.searching = false;
  }
}
