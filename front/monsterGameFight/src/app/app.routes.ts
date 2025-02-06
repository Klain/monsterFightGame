import { Routes } from '@angular/router';

// Definimos las rutas principales de la aplicación
export const routes: Routes = [
  { path: '', redirectTo: 'game', pathMatch: 'full' },  // Redirigir a Dashboard por defecto
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.routes) },
  { path: 'game', loadChildren: () => import('./game/game.routes').then(m => m.routes) },
];