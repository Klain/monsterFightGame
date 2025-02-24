import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CharacterService } from '../../core/services/character.service';
import { Character } from '../../core/models/character.models';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ActivityGridComponent } from '../../shared/activity-grid/activity-grid.component';
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
    ActivityGridComponent,
    CharacterAttributesComponent,
  ],
})
export class DashboardComponent implements OnInit {
  character$: Observable<Character | null>;

  constructor(
    private characterService: CharacterService,
    private snackBar: MatSnackBar
  ) {
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
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
