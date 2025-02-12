//front\monsterGameFight\src\app\shared\activity-widget\activity-widget.component .ts
import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { CharacterService } from '../../core/services/character.service';
import { Character, Activity } from '../../core/models/chacter.models';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityType } from '../../core/constants/activities';
import { SecondsToTimerPipe } from '../../core/pipes/seconds-to-timer.pipe';

@Component({
  selector: 'app-activity-widget',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatSliderModule,SecondsToTimerPipe,FormsModule ],
  templateUrl: './activity-widget.component.html',
  styleUrls: ['./activity-widget.component.css'],
})
export class ActivityWidgetComponent implements OnInit, OnDestroy {
  @Input() activityType!: ActivityType;

  activity: Activity | null = null;
  progress: number = 0;
  remainingTime: number = 0;
  isCompleted: boolean = false;
  duration: number = 1; 
  maxDuration: number = 0; 

  character : Character|null=null;

  private destroy$ = new Subject<void>();

  constructor(
    private characterService: CharacterService,
    ) {}

  ngOnInit() {
    this.characterService.character$
      .pipe(takeUntil(this.destroy$))
      .subscribe((character: Character | null) => {
        if (character) {
          this.character = character;
          this.refreshCharacterData();
        }
      });
  }

  getMaxDuration():number{
    return  this.character?.maxActivityDuration[this.activityType] || 0;
  }

  refreshCharacterData() {
    if (this.character) {
      this.maxDuration = this.character.maxActivityDuration[this.activityType] || 0;
      this.activity = this.character.activity;
  
      if (this.activity) {
        if (this.activity.type === this.activityType) {
          this.startCountdown();
        } else {
          this.resetActivityState();
        }
      } else {
        this.resetActivityState();
      }
    }
  }
  

  private startCountdown() {
    if (!this.activity) return;

    const now = new Date().getTime();
    const startTime = new Date(this.activity.startTime).getTime();
    const elapsedMinutes = Math.floor((now - startTime) / 60000);
    const totalDuration = this.activity.duration;
    this.remainingTime = Math.max(totalDuration - elapsedMinutes, 0);

    this.updateProgress();

    if (this.remainingTime > 0) {
      interval(1000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
            this.updateProgress();
          } else {
            this.completeActivity();
          }
        });
    } else {
      this.completeActivity();
    }
  }

  private updateProgress() {
    if (!this.activity) return;

    const totalSeconds = this.activity.duration * 60;
    const elapsedSeconds = totalSeconds - this.remainingTime * 60;
    this.progress = (elapsedSeconds / totalSeconds) * 100;
  }

  private completeActivity() {
    this.isCompleted = true;
  }

  startActivity() {
    if (this.activity) return; // No iniciar si ya hay una actividad en curso
    this.characterService.startActivity(this.activityType, this.duration);
  }

  claimReward() {
    this.characterService.claimActivityReward();
  }

  private resetActivityState() {
    this.activity = null;
    this.progress = 0;
    this.remainingTime = 0;
    this.isCompleted = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
