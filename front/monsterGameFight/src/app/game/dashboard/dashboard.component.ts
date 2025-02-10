import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CharacterService } from '../../core/services/character.service';
import { ActivityService } from '../../core/services/activity.service';
import { Character } from '../../core/models/chacter.models';
import { ActivityWidgetComponent } from '../../shared/activity-widget/activity-widget.component';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CharacterAttributesComponent } from '../../shared/character-attributes/character-attributes.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    ActivityWidgetComponent,
    CharacterAttributesComponent
  ],
})
export class DashboardComponent implements OnInit {
  character$: Observable<Character | null>;
  currentActivity$: Observable<{
    activityName: string;
    totalDuration: number;
    remainingTime: number;
  } | null>;

  constructor(
    private characterService: CharacterService,
    public activityService: ActivityService,
    private snackBar: MatSnackBar
  ) {
    this.character$ = this.characterService.character$;
    this.currentActivity$ = this.activityService.checkActivityStatus();
  }

  ngOnInit() {
    this.characterService.refreshCharacter();
    this.refreshActivity();
  }

  refreshActivity() {
    this.currentActivity$ = this.activityService.checkActivityStatus();
  }

  completeActivity() {
    this.activityService.claimActivityReward().subscribe({
      next: () => {
        this.refreshActivity();
        this.showToast('Recompensa reclamada con éxito.', 'success');
      },
      error: () => {
        this.showToast('Error al reclamar la recompensa.', 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    let panelClass = '';
    switch (type) {
      case 'success':
        panelClass = 'toast-success';
        break;
      case 'error':
        panelClass = 'toast-error';
        break;
      case 'info':
        panelClass = 'toast-info';
        break;
    }
    this.snackBar.open(message, 'Cerrar', { duration: 3000, panelClass });
  }
}
