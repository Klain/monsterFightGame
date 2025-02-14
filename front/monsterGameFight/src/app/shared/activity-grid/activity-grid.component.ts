import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityWidgetComponent } from '../activity-widget/activity-widget.component'; 
import { ActivityType } from '../../core/enums/activity.enum';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  imports: [CommonModule, ActivityWidgetComponent],
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.css'],
})
export class ActivityGridComponent implements OnInit {
  validActivityTypes: ActivityType[] = [];

  constructor() {}

  ngOnInit() {
    // Agregar todas las actividades excepto NONE
    this.validActivityTypes = Object.values(ActivityType)
      .filter(value => typeof value === 'number' && value !== ActivityType.NONE) as ActivityType[];
  }
}
