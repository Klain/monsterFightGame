import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivityService } from '../../core/services/activity.service';
import { ActivityCardComponent } from '../activity-card/activity-card.component';
import { ActivityType, validActivities } from '../../core/constants/activities';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  imports: [CommonModule, MatGridListModule, ActivityCardComponent],
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.css'],
})
export class ActivityGridComponent implements OnInit {
  activities: ActivityType[] = [...validActivities]; // Todas las actividades disponibles

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    // Refresca el estado de la actividad al inicializar el componente
    this.activityService.refreshCurrentActivity();
  }
}
