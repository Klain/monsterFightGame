import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../constants/config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${Constants.apiUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, body: any = {}): Observable<T> {
    return this.http.post<T>(`${Constants.apiUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${Constants.apiUrl}/${endpoint}`);
  }
}
