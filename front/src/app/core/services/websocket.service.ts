//front\monsterGameFight\src\app\core\services\websocket.service.ts
import { inject, Injectable, Injector } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { Constants } from '../constants/config';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private authService!: AuthService; 
  private socket: Socket | null = null;
  private manuallyDisconnected = false;
  private registeredEvents: Map<string, (...args: any[]) => void> = new Map();
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();

  constructor(
    private tokenService: TokenService, 
    private injector: Injector) {
    setTimeout(() => {
      this.authService = this.injector.get(AuthService);
      this.authService.authState$.subscribe((isAuthenticated:boolean) => {
        if (isAuthenticated) {
          this.connect();
        } else {
          this.disconnect();
        }
      });
    });
  }

  connect(): void {
    const accessToken = this.tokenService.getAccessToken();

    if (!accessToken) {
      console.error('❌ No hay access token disponible. No se puede conectar al WebSocket.');
      return;
    }

    if (this.socket && this.socket.connected) {
      console.warn('⚠️ El socket ya está conectado.');
      return;
    }

    this.manuallyDisconnected = false;

    this.socket = io(Constants.baseUrl, {
      auth: { token: this.tokenService.getAccessToken() },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      transports: ['websocket'],
    });

    this.setupListeners();
  }



  emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`⚠️ Socket no conectado. No se puede emitir evento: ${event}`);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer: any) => {
      if (!this.socket) {
        console.error(`⚠️ Socket no inicializado. No se puede escuchar evento: ${event}`);
        return;
      }

      const callback = (data: any) => observer.next(data);
      this.socket.on(event, callback);
      this.registeredEvents.set(event, callback);

      return () => this.off(event);
    });
  }

  off(event: string): void {
    if (this.socket && this.registeredEvents.has(event)) {
      this.socket.off(event, this.registeredEvents.get(event)!);
      this.registeredEvents.delete(event);
    }
  }

  private registerEvent(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
      this.registeredEvents.set(event, callback);
    }
  }

  disconnect(): void {
    if (!this.socket) {
      console.warn('⚠️ Socket ya está desconectado.');
      return;
    }

    this.manuallyDisconnected = true;
    this.isConnectedSubject.next(false);

    this.registeredEvents.forEach((callback, event) => {
      this.socket?.off(event, callback);
    });
    this.registeredEvents.clear();

    this.socket.disconnect();
    this.socket = null;
    console.log('⏹️ Desconectado manualmente del WebSocket.');
  }

  reconnectWithNewToken(): void {
    console.log('🔄 Intentando reconectar con un nuevo access token...');
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }


  private setupListeners(): void {
    if (!this.socket) {
      console.error('❌ Socket no inicializado. Listeners no configurados.');
      return;
    }

    this.registerEvent('connect', () => {
      console.log('✅ Conectado al servidor WebSocket con ID:', this.socket?.id);
      this.isConnectedSubject.next(true);
      this.emit("register", this.tokenService.getAccessToken()); // Emitir evento de registro
    });

    this.registerEvent('disconnect', (reason: string) => {
      console.warn('⚠️ Desconectado del servidor WebSocket:', reason);
      this.isConnectedSubject.next(false);

      if (this.manuallyDisconnected) {
        console.log('⏹️ Desconexión manual, no se intentará reconectar.');
        return;
      }

      if (reason === 'io server disconnect') {
        console.warn('🚨 El servidor ha cerrado la conexión. Intentando reconectar...');
        setTimeout(() => this.connect(), 5000);
      }
    });

    this.registerEvent('connect_error', (error: any) => {
      console.error('❌ Error de conexión al WebSocket:', error);
    });

    this.registerEvent('reconnect_attempt', (attempt: number) => {
      console.info('🔄 Intentando reconectar... Intento número:', attempt);
    });

    this.registerEvent('reconnect', () => {
      console.log('✅ Reconexión exitosa al servidor WebSocket.');
      this.isConnectedSubject.next(true);
    });

    this.registerEvent('error', (error: any) => {
      console.error('❌ Error recibido del servidor WebSocket:', error);
    });

    this.registerEvent('registered', (data: any) => {
      console.log(`🎉 Usuario registrado en WebSocket:`, data);
    });

    this.registerEvent('characterRefresh', (data: any) => {
      console.log('🆕 Refrescando personaje:', data);
    });
  }
}
