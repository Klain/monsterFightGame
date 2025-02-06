import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // <-- Hace que el servicio esté disponible globalmente
})
export class CharacterService {
  private apiUrl = 'http://localhost:4000/api/characters';

  constructor(private http: HttpClient) {}

  // Obtener la información del personaje del backend
  getCharacter(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Iniciar entrenamiento
  startTraining(): Observable<any> {
    return this.http.post(`${this.apiUrl}/train`, {});
  }

  // Iniciar sanación
  startHealing(): Observable<any> {
    return this.http.post(`${this.apiUrl}/heal`, {});
  }

  // Buscar oponente para combate
  findOpponent(): Observable<any> {
    return this.http.get(`${this.apiUrl}/find-opponent`);
  }
}
