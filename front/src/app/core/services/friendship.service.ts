import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class FriendshipService {
  constructor(private apiService: ApiService) {}

  getFriends(): Observable<any> {
    return this.apiService.post('friends', {}); // Se usa POST porque el backend así lo maneja
  }
  sendFriendRequest(friendId: number): Observable<any> {
    return this.apiService.post('sendFriendRequest', { friendId });
  }
  acceptFriendship(friendshipId: number): Observable<any> {
    return this.apiService.post('acceptFriendship', { friendshipId });
  }
  deleteFriendship(friendshipId: number): Observable<any> {
    return this.apiService.post('deleteFriendship', { friendshipId });
  }
}
