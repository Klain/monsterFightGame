import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from '../../core/services/activity.service';

@Component({
  selector: 'app-activity-widget',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './activity-widget.component.html',
  styleUrls: ['./activity-widget.component.css']
})
export class ActivityWidgetComponent implements OnInit {
  @Input() activityName: string = '';
  @Input() totalDuration: number = 0;
  @Input() remainingTime: number = 0; 

  progress: number = 0; 
  intervalId: any = null;
  isCompleted: boolean = false;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    this.updateProgress();

    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateProgress();
      } else {
        clearInterval(this.intervalId);
        this.remainingTime = 0;
        this.isCompleted = true;
      }
    }, 1000); 
  }

  updateProgress() {
    this.progress = ((this.totalDuration * 60 - this.remainingTime) / (this.totalDuration * 60)) * 100;
  }

  claimReward() {
    this.activityService.claimActivityReward().subscribe({
      next: () => {
        this.isCompleted = false;
        alert('Recompensa reclamada con éxito.');
      },
      error: () => {
        alert('Error al reclamar recompensa.');
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
