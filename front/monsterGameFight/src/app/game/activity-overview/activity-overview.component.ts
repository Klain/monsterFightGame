import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimeProgressBarComponent } from '../../shared/time-progress-bar/time-progress-bar.component';

@Component({
  selector: 'app-activity-overview',
  standalone: true,
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css'],
  imports: [CommonModule, TimeProgressBarComponent]
})
export class ActivityOverviewComponent implements OnInit, OnDestroy {
  @Input() characterId!: number;
  activityData: any = null;
  apiUrl = 'http://localhost:4000/api/activity';
  currentTime: number = Date.now(); 
  private intervalId: any;

  constructor(private http: HttpClient) {}

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
    this.http.get(`${this.apiUrl}/status/${this.characterId}`).subscribe({
      next: (data: any) => {
        this.activityData = data;
      },
      error: () => {
        this.activityData = null;
      }
    });
  }

  claimReward() {
    this.http.post(`${this.apiUrl}/claim/${this.characterId}`, {}).subscribe({
      next: (response: any) => {
        alert(response.message);
        this.activityData = null;
      }
    });
  }
}
