import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseEndpoint = 'messages';

  constructor(private api: ApiService) {}

  getMessagesInbox(page: number = 1, limit: number = 20): Observable<any> {
    return this.api.get(`${this.baseEndpoint}/inbox?page=${page}&limit=${limit}&inbox={true}`);
  }
  getMessagesOutbox(page: number = 1, limit: number = 20): Observable<any> {
    return this.api.get(`${this.baseEndpoint}/outbox?page=${page}&limit=${limit}&inbox={false}`);
  }
  sendMessage(friendshipId: number, subject: string, body: string): Observable<any> {
    return this.api.post(`${this.baseEndpoint}/send`, {
      friendshipId: friendshipId,
      subject,
      body,
    });
  }

  markMessageAsRead(messageId: number): Observable<any> {
    return this.api.post(`${this.baseEndpoint}/read/${messageId}`);
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.api.delete(`${this.baseEndpoint}/${messageId}`);
  }
}
