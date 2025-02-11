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
    this.socket = io(Constants.baseUrl); 
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