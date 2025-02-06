import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;

  constructor() {
    this.socket = io('http://localhost:4000', {
      transports: ['websocket']
    });
  }

  sendMessage(event: string, data: any) {
    this.socket.emit(event, data);
  }

  listen(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
