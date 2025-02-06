import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // <-- Necesario para hacer peticiones HTTP
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarComponent } from './core/navbar/navbar.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),  // <-- Agregar esto
    provideAnimations(),
    importProvidersFrom(BrowserModule),
    NavbarComponent
  ]
};