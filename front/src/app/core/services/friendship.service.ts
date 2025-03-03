import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface FriendshipResponse {
  friendshipId: number;
  username: string;
  active: boolean;
}

export interface FriendshipListResponse {
  friends: FriendshipResponse[];
  incomingRequests: FriendshipResponse[];
  outgoingRequests: FriendshipResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class FriendshipService {
  constructor(private apiService: ApiService) {}
  getFriendships(): Observable<FriendshipListResponse> {
    return this.apiService.get<FriendshipListResponse>('friendship/friends');
  }
  sendFriendRequest(friendshipId: number): Observable<any> {
    return this.apiService.post('friendship/sendFriendRequest', { friendshipId });
  }
  acceptFriendship(friendshipId: number): Observable<any> {
    return this.apiService.post('friendship/acceptFriendship', { friendshipId });
  }
  deleteFriendship(friendshipId: number): Observable<any> {
    return this.apiService.post('friendship/deleteFriendship', { friendshipId });
  }
}
