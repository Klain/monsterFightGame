import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CharacterComponent } from './character/character.component';
import { CombatComponent } from './combat/combat.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'character', component: CharacterComponent },
  { path: 'combat', component: CombatComponent },
];