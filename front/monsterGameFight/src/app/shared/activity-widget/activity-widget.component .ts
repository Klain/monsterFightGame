import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from '../../core/services/activity.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-activity-widget',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './activity-widget.component.html',
  styleUrls: ['./activity-widget.component.css']
})
export class ActivityWidgetComponent implements OnInit, OnDestroy {
  activityName: string = '';
  totalDuration: number = 0;
  remainingTime: number = 0;
  progress: number = 0;
  isCompleted: boolean = false;

  private countdownSub: Subscription | null = null;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.loadActivityStatus();
  }

  loadActivityStatus() {
    this.activityService.checkActivityStatus().subscribe({
      next: (data) => {
        if(data){
          if (data.status === 'in_progress' && data.activity) {
            this.activityName = data.activity.type;
            this.totalDuration = data.activity.duration;
            this.remainingTime = data.activity.getRemainingTime();
            this.startCountdown();
          } else if (data.status === 'completed') {
            this.isCompleted = true;
          }
        }
      },
      error: () => {
        console.error('Error al obtener el estado de la actividad.');
      }
    });
  }

  startCountdown() {
    this.updateProgress();

    this.countdownSub = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateProgress();
      } else {
        this.completeActivity();
      }
    });
  }

  updateProgress() {
    this.progress = ((this.totalDuration * 60 - this.remainingTime) / (this.totalDuration * 60)) * 100;
  }

  completeActivity() {
    this.isCompleted = true;
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
  }

  claimReward() {
    this.activityService.claimActivityReward().subscribe({
      next: () => {
        this.isCompleted = false;
        this.loadActivityStatus(); 
      },
      error: () => {
        alert('Error al reclamar recompensa.');
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
  }
}
