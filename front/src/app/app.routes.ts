import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AutoLoginGuard } from './core/guards/autologin.guard';
import { HasCharacterGuard } from './core/guards/has-character.guard';
import { NotCharacterGuard } from './core/guards/not-character.guard';
import { CharacterCreateComponent } from './game/character-create/character-create.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },  
  { path: 'character-create', component: CharacterCreateComponent, canActivate: [AuthGuard, HasCharacterGuard] }, 
  { path: 'auth', loadChildren: () => import('./game/auth/auth.routes').then(m => m.routes), canActivate: [AutoLoginGuard] },
  { path: 'game', loadChildren: () => import('./game/game.routes').then(m => m.routes), canActivate: [AuthGuard, NotCharacterGuard] },
];
