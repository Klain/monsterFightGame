import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityWidgetComponent } from '../activity-widget/activity-widget.component'; 
import { validActivities, ActivityType } from '../../core/constants/activities';

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
    this.validActivityTypes = validActivities.filter(activity => activity !== "null");
  }
}
