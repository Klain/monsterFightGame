import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CombatService } from '../../core/services/combat.service';
import { FriendshipService } from '../../core/services/friendship.service';
import { LeaderboardCharacter } from '../../core/interfaces/combat.interfaces';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardCharacter[] = [];
  page: number = 1;
  limit: number = 20;
  totalPages: number = 1;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private combatService: CombatService, 
    private friendshipService: FriendshipService
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  /** ✅ Carga la tabla de clasificación con los datos de amistad */
  loadLeaderboard(): void {
    this.loading = true;
    this.errorMessage = null;
  
    this.combatService.getLeaderboard(this.page, this.limit).subscribe({
      next: (response) => {
        console.log("Leaderboard Data:", response.characters);
        this.leaderboard = response.characters.map(character => ({
          ...character,
          isFriend: character.isFriend ?? false,
          canSendRequest: character.canSendRequest ?? false,
          isOwnCharacter: character.isOwnCharacter ?? false
        }));
        this.page = response.page;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error al obtener el leaderboard:", error);
        this.errorMessage = "Hubo un problema al cargar el leaderboard.";
        this.loading = false;
      }
    });
  }

  /** ✅ Envía solicitud de amistad */
  sendFriendRequest(friendshipId: number): void {
    this.friendshipService.sendFriendRequest(friendshipId).subscribe({
      next: () => {
        this.leaderboard = this.leaderboard.map(character =>
          character.id === friendshipId
            ? { ...character, isFriend: false, canSendRequest: false }
            : character
        );
      },
      error: (error) => {
        console.error("Error al enviar solicitud de amistad:", error);
        this.errorMessage = "No se pudo enviar la solicitud.";
      }
    });
  }

  /** ✅ Paginación */
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLeaderboard();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadLeaderboard();
    }
  }
}
