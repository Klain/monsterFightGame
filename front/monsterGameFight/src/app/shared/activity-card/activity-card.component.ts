import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivityService } from '../../core/services/activity.service';
import { ActivityType } from '../../core/constants/activities';
import { FormsModule } from '@angular/forms';
import { SecondsToTimerPipe } from '../../core/pipes/seconds-to-timer.pipe';
import { Subscription } from 'rxjs';
import { Activity } from '../../core/models/activity.model';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
    MatProgressBarModule,
    FormsModule,
    SecondsToTimerPipe,
  ],
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.css'],
})
export class ActivityCardComponent implements OnInit, OnDestroy {
  @Input() activity!: ActivityType;

  maxDuration: number = 1;
  selectedDuration: number = 1;
  remainingTime: number = 0;
  totalDuration: number = 0;
  progress: number = 0;
  isInProgress: boolean = false;
  isLoading: boolean = false;

  currentActivitySubscription: Subscription | null = null;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.fetchMaxDuration();
    this.listenToActivityStatus();
  }

  ngOnDestroy() {
    this.currentActivitySubscription?.unsubscribe();
  }
  
  listenToActivityStatus() {
    this.currentActivitySubscription = this.activityService.currentActivity$.subscribe((status) => {
      if (status?.status === 'in_progress' && status.activity?.type === this.activity) {
        this.setActivityInProgress(status.activity);
      } else {
        this.fetchMaxDuration();
      }
    });
  }
  
  fetchMaxDuration() {
    this.activityService.getMaxDuration(this.activity).subscribe({
      next: (response) => {
        this.maxDuration = response.maxDuration;
        this.selectedDuration = Math.min(this.selectedDuration, this.maxDuration);
      },
      error: () => {
        this.maxDuration = 1; // Manejo de error
      },
    });
  }
  

  startActivity() {
    if (this.isLoading || this.isInProgress || this.selectedDuration < 1) return;
  
    this.isLoading = true;
    this.activityService.startActivity(this.activity, this.selectedDuration).subscribe({
      next: () => {
        this.activityService.refreshCurrentActivity();
      },
      error: (response) => alert(response.error.message),
      complete: () => (this.isLoading = false),
    });
  }

  setActivityInProgress(activity: Activity) {
    this.remainingTime = activity.getRemainingTime();
    this.totalDuration = activity.duration * 60;
    this.isInProgress = true;
    this.startCountdown();
  }
  
  checkActivityStatus() {
    this.activityService.checkActivityStatus().subscribe({
      next: (status) => {
        if (status) {
          if (status.status === 'in_progress' && status.activity?.type === this.activity) {
            this.setActivityInProgress(status.activity);
          } else if (status.status === 'idle') {
            this.fetchMaxDuration();
          }
        }
      },
      error: () => {
        this.fetchMaxDuration();
      },
    });
  }

  claimReward() {
    this.isLoading = true;
    this.activityService.claimActivityReward().subscribe({
      next: () => {
        alert('Recompensa reclamada con éxito.');
        this.resetActivityState();
      },
      error: () => alert('Error al reclamar recompensa.'),
      complete: () => (this.isLoading = false),
    });
  }

  startCountdown() {
    setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateProgress();
      } else {
        this.resetActivityState();
      }
    }, 1000);
  }

  updateProgress() {
    this.progress = ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100;
  }

  resetActivityState() {
    this.isInProgress = false;
    this.remainingTime = 0;
    this.totalDuration = 0;
    this.progress = 0;
  }
}
