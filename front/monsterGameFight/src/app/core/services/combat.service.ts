import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Opponent, CombatResult, HeistLog } from '../../core/interfaces/combat.interfaces';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  constructor(private apiService: ApiService) {}

  searchOpponents(): Observable<{ opponents: Opponent[] }> {
    return this.apiService.get('combat/searchOpponent');
  }

  startAssault(defenderId: number): Observable<CombatResult> {
    return this.apiService.post('combat/assault', { defender_id: defenderId });
  }

  startHeist(defenderId: number): Observable<HeistLog> {
    return this.apiService.post('combat/heist', { defender_id: defenderId });
  }
}
