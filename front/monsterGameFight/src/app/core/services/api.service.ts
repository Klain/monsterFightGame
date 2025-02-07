import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

post<T>(endpoint: string, body: any = {}): Observable<T> {
  console.log("📡 Enviando POST a:", `${this.baseUrl}/${endpoint}`);
  console.log("📩 Datos enviados:", JSON.stringify(body, null, 2));

  return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
    headers: {
      "Content-Type": "application/json",  // 🔥 Forzar formato JSON
    },
    observe: 'response'
  }).pipe(
    tap((response: any) => console.log("✅ Respuesta del servidor:", response)),
    catchError((error: any) => {
      console.error("❌ Error en la petición POST:", error);
      return throwError(error);
    })
  );
}
}
