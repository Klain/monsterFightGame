
//front\monsterGameFight\src\app\shared\activity-widget\activity-widget.component .ts
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { CharacterService } from '../../core/services/character.service';
import { Character, Activity } from '../../core/models/character.models';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityType,getActivityName } from '../../core/enums/activity.enum';
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

  public getActivityName = getActivityName;
  private destroy$ = new Subject<void>();
  private countdownDestroy$ = new Subject<void>();


  constructor(
    private characterService: CharacterService
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

  refreshCharacterData() {
    if (this.character) {
      this.maxDuration = this.character.maxActivityDuration[this.activityType] || 0;
      this.activity = this.character.activity;
  
      if (this.activity && this.activity.type === this.activityType) {
        this.startCountdown();
      } else {
        this.resetActivityState();
      }
    } else {
      this.resetActivityState();
    }
  }
  
  ensureValidDuration(value: number) {
    if (value < 1) {
      this.duration = 1;
    } else {
      this.duration = value;
    }
  }
  
  private startCountdown() {
    if (!this.activity) return;
  
    const now = new Date().getTime();
    const startTime = new Date(this.activity.startTime).getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const totalSeconds = this.activity.duration;
  
    this.remainingTime = Math.max(totalSeconds - elapsedSeconds, 0);
    this.updateProgress();
  
    if (this.remainingTime > 0) {
      // 🔥 Cancela cualquier anterior ejecución del intervalo
      this.countdownDestroy$.next(); 
  
      interval(1000)
        .pipe(takeUntil(this.countdownDestroy$))
        .subscribe(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
            this.updateProgress();
          } else {
            this.completeActivity();
            this.countdownDestroy$.next();
          }
        });
    } else {
      this.completeActivity();
    }
  }
  
  
  private updateProgress() {
    if (!this.activity) return;
  
    const totalSeconds = this.activity.duration; 
    const elapsedSeconds = totalSeconds - this.remainingTime;
  
    this.progress = (elapsedSeconds / totalSeconds) * 100;
  }
  
  private completeActivity() {
    this.remainingTime = 0;
    this.progress = 100;
    this.isCompleted = true;
  }
  
  startActivity() {
    if (this.activity) return;
    this.characterService.startActivity(this.activityType, this.duration);
  }

  claimReward() {
    this.characterService.claimActivityReward();
    this.resetActivityState();
  }

  private resetActivityState() {
    this.countdownDestroy$.next();
    this.activity = null;
    this.progress = 0;
    this.remainingTime = 0;
    this.isCompleted = false;
  }
  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.countdownDestroy$.next();
    this.countdownDestroy$.complete();
  }
  
}