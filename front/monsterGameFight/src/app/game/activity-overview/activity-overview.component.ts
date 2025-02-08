import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimeProgressBarComponent } from '../../shared/time-progress-bar/time-progress-bar.component';
import { Character } from '../../core/models/chacter.models';
import { Observable } from 'rxjs';
import { CharacterService } from '../../core/services/character.service';

@Component({
  selector: 'app-activity-overview',
  standalone: true,
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css'],
  imports: [CommonModule, TimeProgressBarComponent]
})
export class ActivityOverviewComponent implements OnInit, OnDestroy {
  character$: Observable<Character | null>;
  
  activityData: any = null;
  currentTime: number = Date.now(); 
  private intervalId: any;

 constructor(private characterService: CharacterService) {
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
    this.getActivityStatus();
    this.intervalId = setInterval(() => {
      this.currentTime = Date.now(); 
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }
  }

  getActivityStatus() {
    this.characterService.activityCheckStatus().subscribe({
      next:(activity)=>{
        this.activityData=activity;
      }
    });

  }

  claimReward() {
    this.characterService.activityClaimReward().subscribe({
      next:()=>{
        this.activityData=undefined;
      }
    });
  }
}
