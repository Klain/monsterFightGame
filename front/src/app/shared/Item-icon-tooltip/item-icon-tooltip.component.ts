import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'item-icon-tooltip',
  standalone:true,
  templateUrl: './item-icon-tooltip.component.html',
  styleUrls: ['./item-icon-tooltip.component.css'],
  imports:[
    CommonModule,
    MatCardModule
  ]
})
export class ItemIconTooltipComponent {
  @Input() visible = false;
  position = { x: 0, y: 0 };

  show(x: number, y: number): void {
    this.position = { x, y };
    this.visible = true;
  }
  hide(): void { this.visible = false; }
  stopPropagation(event: MouseEvent): void { event.stopPropagation();}
}
