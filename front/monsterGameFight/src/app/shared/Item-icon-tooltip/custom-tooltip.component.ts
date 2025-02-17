import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'app-custom-tooltip',
  standalone:true,
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.css'],
  imports:[
    CommonModule,
    MatCardModule
  ]
})
export class CustomTooltipComponent {
  @Input() visible = false;
  position = { x: 0, y: 0 };

  show(x: number, y: number): void {
    this.position = { x, y };
    this.visible = true;
  }
  hide(): void { this.visible = false; }
  stopPropagation(event: MouseEvent): void { event.stopPropagation();}
}
