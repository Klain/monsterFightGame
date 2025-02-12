import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CharacterComponent } from './character/character.component';
import { CombatComponent } from './combat/combat.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'character', component: CharacterComponent, canActivate: [AuthGuard] },
  { path: 'combat', component: CombatComponent, canActivate: [AuthGuard] }
];
