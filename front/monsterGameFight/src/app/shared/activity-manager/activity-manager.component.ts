import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimeProgressBarComponent } from '../time-progress-bar/time-progress-bar.component';

@Component({
  selector: 'app-activity-manager',
  standalone: true,
  templateUrl: './activity-manager.component.html',
  styleUrls: ['./activity-manager.component.css'],
  imports: [CommonModule, TimeProgressBarComponent]
})
export class ActivityManagerComponent implements OnInit {
  @Input() characterId!: number; // ID del personaje
  @Input() activityType!: string; // Tipo de actividad ('trabajo', 'entrenamiento')

  activityData: any = null;
  isLoading = false;
  apiUrl = 'http://localhost:4000/api/activity';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkActivityStatus();
  }

  checkActivityStatus() {
    this.http.get(`${this.apiUrl}/status/${this.characterId}`).subscribe({
      next: (data: any) => {
        if (data.isCompleted) {
          this.claimReward();
        } else {
          this.activityData = data;
        }
      },
      error: () => {
        this.activityData = null; // Si no hay actividad en curso, permitimos iniciar una nueva
      }
    });
  }

  startActivity() {
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/start`, {
      character_id: this.characterId,
      type: this.activityType
    }).subscribe({
      next: (response: any) => {
        this.activityData = { remainingMinutes: response.duration * 60 }; // Convertimos minutos a segundos
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  claimReward() {
    this.http.post(`${this.apiUrl}/claim/${this.characterId}`, {}).subscribe({
      next: (response: any) => {
        alert(response.message);
        this.activityData = null; // Reiniciar el estado para permitir iniciar otra actividad
      }
    });
  }
}
