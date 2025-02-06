import { Routes } from '@angular/router';
import { ActivityPageComponent } from './game/activity-page/activity-page.component';

// Definimos las rutas principales de la aplicación
export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },  
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.routes) },
  { path: 'game', loadChildren: () => import('./game/game.routes').then(m => m.routes) },
  { path: 'activities', component: ActivityPageComponent }

];