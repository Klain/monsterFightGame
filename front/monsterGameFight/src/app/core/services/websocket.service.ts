import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Constants } from '../constants/config';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(Constants.baseUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket'],
    });
  
    // Log de conexión exitosa
    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket con ID:', this.socket.id);
    });
  
    // Log de desconexión
    this.socket.on('disconnect', (reason: string) => {
      console.warn('Desconectado del servidor WebSocket:', reason);
    });
  
    // Log de intento de reconexión
    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.info('Intentando reconectar... Intento número:', attempt);
    });
  
    // Log de reconexión exitosa
    this.socket.on('reconnect', () => {
      console.log('Reconexión exitosa al servidor WebSocket.');
    });

    this.socket.on('error', (error: any) => {
      console.error('Error en WebSocket:', error);
    });
  }

  on(event: string): Observable<any> {
    return new Observable((observer : any) => {
      this.socket.on(event, (data : any) => {
        observer.next(data);
      });
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

}