import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-activity-selection',
  standalone: true,
  templateUrl: './activity-selection.component.html',
  styleUrls: ['./activity-selection.component.css'],
  imports: [CommonModule, MatCardModule, MatButtonModule]
})
export class ActivitySelectionComponent {
  activities = [
    { type: 'trabajo', duration: 60, xp: 100, gold: 50 },
    { type: 'entrenamiento', duration: 30, xp: 150, gold: 20 }
  ];
  
  constructor(private http: HttpClient) {}

  startActivity(activityType: string) {
    this.http.post('http://localhost:4000/api/activity/start', {
      character_id: 1, // TODO: Reemplazar con ID real
      type: activityType
    }).subscribe({
      next: (response: any) => alert(`Actividad ${activityType} iniciada!`),
      error: () => alert(`Error al iniciar ${activityType}`)
    });
  }
}
