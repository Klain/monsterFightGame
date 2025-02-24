import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-progress-bar',
  standalone: true,
  templateUrl: './time-progress-bar.component.html',
  styleUrls: ['./time-progress-bar.component.css'],
  imports: [CommonModule]
})
export class TimeProgressBarComponent implements OnInit {
  @Input() duration!: number; // Duración total en segundos
  @Input() startTime!: number; // Timestamp de inicio en milisegundos
  @Input() showCancelButton: boolean = false; // Muestra botón de cancelar (opcional)

  remainingTime: number = 0;
  progressPercentage: number = 0;
  intervalId: any;

  ngOnInit() {
    this.updateProgress();
    this.intervalId = setInterval(() => this.updateProgress(), 1000); // Actualizar cada segundo
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  updateProgress() {
    const now = Date.now();
    const elapsedTime = (now - this.startTime) / 1000; // Tiempo transcurrido en segundos
    this.remainingTime = Math.max(this.duration - elapsedTime, 0);

    this.progressPercentage = (elapsedTime / this.duration) * 100;

    if (this.remainingTime <= 0) {
      clearInterval(this.intervalId);
    }
  }

  cancelActivity() {
    alert("Actividad cancelada."); // Aquí se puede emitir un evento para manejar la cancelación
  }
}
