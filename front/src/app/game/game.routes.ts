import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CharacterComponent } from './character/character.component';
import { CombatComponent } from './combat/combat.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { MessagesComponent } from './mesages/messages.component';
import { ShopDisplayComponent } from './shop-display/shop-display.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'character', component: CharacterComponent, canActivate: [AuthGuard] },
  { path: 'combat', component: CombatComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'shop', component: ShopDisplayComponent, canActivate: [AuthGuard] },
];
