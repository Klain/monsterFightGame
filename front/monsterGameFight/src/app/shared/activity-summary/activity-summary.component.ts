import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activity-summary',
  standalone: true,
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.css'],
  imports: [CommonModule]
})
export class ActivitySummaryComponent implements OnInit {
  @Input() characterId!: number;
  activityData: any = null;
  apiUrl = 'http://localhost:4000/api/activity';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    //this.getActivityStatus();
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
}
