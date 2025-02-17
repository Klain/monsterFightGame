//front\monsterGameFight\src\app\core\services\websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Constants } from '../constants/config';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;

  constructor() {
    // Escuchar el evento para conectar el WebSocket
    document.addEventListener('websocket:connect', () => {
      this.connect();
    });
  }

  connect(): void {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      console.error('No hay access token disponible. No se puede conectar al WebSocket.');
      return;
    }

    if (!this.socket || !this.socket.connected) {
      this.socket = io(Constants.baseUrl, {
        auth: {
          token: accessToken,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        transports: ['websocket'],
      });

      this.setupListeners();
    } else {
      console.warn('Socket ya está conectado.');
    }
  }
  

  // Configurar listeners de eventos globales
  private setupListeners(): void {
    if (!this.socket) {
      console.error('Socket no inicializado. Listeners no configurados.');
      return;
    }

    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket con ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('Desconectado del servidor WebSocket:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Error de conexión al WebSocket:', error);
    });

    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.info('Intentando reconectar... Intento número:', attempt);
    });

    this.socket.on('reconnect', () => {
      console.log('Reconexión exitosa al servidor WebSocket.');
    });

    this.socket.on('error', (error: any) => {
      console.error('Error recibido del servidor WebSocket:', error);
    });
  }

  // Enviar un evento al servidor
  emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      console.error(`Socket no inicializado. No se puede emitir evento: ${event}`);
      this.connect(); // Intentar conectar antes de emitir
      return;
    }
  
    this.socket.emit(event, data);
  }
  

  // Escuchar un evento del servidor
  on(event: string): Observable<any> {
    return new Observable((observer:any) => {
      if (!this.socket || !this.socket.connected) {
        console.error(`Socket no inicializado. No se puede escuchar evento: ${event}`);
        this.connect(); // Intentar conectar antes de escuchar
        return;
      }
  
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
  
      // Limpieza cuando el observable se desuscriba
      return () => this.socket?.off(event);
    });
  }
  

  // Desconectar manualmente del WebSocket
  disconnect(): void {
    if (!this.socket) {
      console.warn('Socket ya está desconectado.');
      return;
    }
    this.socket.disconnect();
    this.socket = null;
    console.log('Desconectado manualmente del WebSocket.');
  }

  // Reintentar conexión con un nuevo token (por ejemplo, tras renovar el accessToken)
  reconnectWithNewToken(): void {
    console.log('Intentando reconectar con un nuevo access token...');
    this.disconnect();
    this.connect();
  }
}
