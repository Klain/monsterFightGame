import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitySelectionComponent } from '../activity-selection/activity-selection.component';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  templateUrl: './activity-page.component.html',
  styleUrls: ['./activity-page.component.css'],
  imports: [CommonModule, ActivitySelectionComponent]
})
export class ActivityPageComponent {}
